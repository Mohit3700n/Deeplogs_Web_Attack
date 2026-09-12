from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import io
import json
import geoip2.database
import os

app = FastAPI(title="DeepLog Engine")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load GeoIP Database safely
reader = None
db_path = 'GeoLite2-City.mmdb'
if os.path.exists(db_path):
    try:
        reader = geoip2.database.Reader(db_path)
        print("GeoIP Database loaded successfully.")
    except Exception as e:
        print(f"Error loading GeoIP database: {e}")
else:
    print("Warning: GeoLite2-City.mmdb not found. Map will use fallback data.")

def get_location_from_ip(ip_address):
    if not reader:
        return None
    try:
        response = reader.city(ip_address)
        return {
            "city": response.city.name or "Unknown",
            "lat": response.location.latitude,
            "lng": response.location.longitude,
            "attacks": 1
        }
    except Exception:
        return None

# Load your trained model pipeline
try:
    print("Loading ML Pipeline...")
    model_pipeline = joblib.load('deeplog_pipeline.pkl')
except Exception as e:
    print(f"Error loading model: {e}")

@app.post("/analyze/")
async def analyze_log(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Filhaal sirf CSV log files allowed hain.")
    
    try:
        # 1. Read uploaded file in memory
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), on_bad_lines='skip')
        
        # 2. Safe Data Preparation
        text_cols = ['URL', 'content', 'cookie', 'User-Agent']
        for col in text_cols:
            if col not in df.columns:
                df[col] = ""
            else:
                df[col] = df[col].fillna("")
        
        # Master Payload Create karo
        df['Master_Payload'] = df['URL'] + " " + df['content'] + " " + df['cookie'] + " " + df['User-Agent']
        
        # Ensure categorical columns exist
        cat_cols = ['Method', 'content-type', 'connection']
        for col in cat_cols:
            if col not in df.columns:
                df[col] = "unknown"
            else:
                df[col] = df[col].fillna("unknown")
                
        # Ensure numeric length column exists
        if 'lenght' not in df.columns:
            df['lenght'] = 0
        else:
            df['lenght'] = pd.to_numeric(df['lenght'], errors='coerce').fillna(0)
        
        # 3. Model Prediction
        predictions = model_pipeline.predict(df)
        df['Prediction'] = predictions
        
        # 4. Filter Malicious Data
        malicious_traffic = df[df['Prediction'] == 1]
        
        # 5. Dynamic Geo-IP Location Processing
        locations_map = {}
        if 'IP' in malicious_traffic.columns:
            for ip in malicious_traffic['IP']:
                loc_info = get_location_from_ip(str(ip).strip())
                if loc_info and loc_info['lat'] is not None and loc_info['lng'] is not None:
                    city = loc_info['city']
                    if city in locations_map:
                        locations_map[city]['attacks'] += 1
                    else:
                        locations_map[city] = loc_info
            dynamic_locations = list(locations_map.values())
        else:
            # Fallback agar CSV mein 'IP' column nahi hai
            dynamic_locations = [
                {"city": "Test Location (No IP Column)", "lat": 20.5937, "lng": 78.9629, "attacks": int(len(malicious_traffic))}
            ]
        
        # 6. Output JSON Generate karo
        # --- NEW: Dynamic Threat Intel Calculation ---
        threat_intel = []
        if 'IP' in malicious_traffic.columns and not malicious_traffic.empty:
            ip_counts = malicious_traffic['IP'].value_counts().head(20) # Top 20 attackers
            for ip, count in ip_counts.items():
                # Calculate dynamic risk score based on attack volume
                risk_score = min(100, 50 + (count * 10)) 
                status = "Blocked" if risk_score > 80 else "Monitoring"
                threat_intel.append({
                    "ip": str(ip),
                    "score": f"{risk_score}/100",
                    "type": "High Volume Attack" if count > 5 else "Suspicious Probe",
                    "status": status
                })

        # 6. Output JSON Generate karo
        response_data = {
            "status": "success",
            "summary": {
                "total_requests": int(len(df)),
                "malicious_attacks": int(len(malicious_traffic)),
                "clean_traffic": int(len(df) - len(malicious_traffic))
            },
            "locations": dynamic_locations,
            "recent_threats": malicious_traffic[['Method', 'URL']].to_dict(orient='records') if 'Method' in malicious_traffic.columns and 'URL' in malicious_traffic.columns else [],
            "threat_intel": threat_intel,
            # Model metrics extracted from your training screenshot (image_562f25.png)
            "model_metrics": {
                "accuracy": "98.0%",
                "precision": "99.0%",
                "recall": "97.0%"
            }
        }
        
        return response_data

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))