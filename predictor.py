from pathlib import Path

import joblib
import pandas as pd

from feature_exactor import EXPECTED_FEATURES, extract_features, validate_features


DEFAULT_MODEL_PATH = Path(__file__).with_name("deeplog_web_attack_model.pkl")
DEFAULT_FEATURES_PATH = Path(__file__).with_name("deeplog_features.pkl")
DEFAULT_THRESHOLD = 0.45


class Predictor:
    def __init__(
        self,
        model_path=DEFAULT_MODEL_PATH,
        features_path=DEFAULT_FEATURES_PATH,
        threshold=DEFAULT_THRESHOLD,
    ):
        if not 0 <= threshold <= 1:
            raise ValueError("threshold must be between 0 and 1")

        self.model = joblib.load(model_path)
        self.features = list(joblib.load(features_path))
        self.threshold = float(threshold)

        if self.features != EXPECTED_FEATURES:
            raise ValueError(
                "Model feature schema does not match the shared feature extractor."
            )

        model_features = list(getattr(self.model, "feature_names_in_", []))
        if model_features and model_features != self.features:
            raise ValueError(
                "Model feature names do not match the saved feature schema."
            )

        if 1 not in self.model.classes_:
            raise ValueError("Model must contain class label 1 for Attack")

        self.attack_class_index = list(self.model.classes_).index(1)

    def predict_features(self, feature_data, threshold=None):
        features = dict(feature_data)
        validate_features(features)

        selected_threshold = self.threshold if threshold is None else float(threshold)
        if not 0 <= selected_threshold <= 1:
            raise ValueError("threshold must be between 0 and 1")

        input_df = pd.DataFrame([features], columns=self.features)
        probabilities = self.model.predict_proba(input_df)[0]
        attack_probability = float(probabilities[self.attack_class_index])

        return {
            "prediction": "Attack" if attack_probability >= selected_threshold else "Normal",
            "attack_probability": round(attack_probability, 4),
            "threshold": selected_threshold,
        }

    def predict_request(
        self,
        url,
        method="GET",
        content="",
        content_type="",
        threshold=None,
    ):
        features = extract_features(
            url=url,
            method=method,
            content=content,
            content_type=content_type,
        )
        return self.predict_features(features, threshold=threshold)
