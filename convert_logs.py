import gzip
import re
import pandas as pd

# Regular Expression to match cPanel / Apache combined log format from your screenshot
log_pattern = r'(?P<ip>\S+) \S+ \S+ \[.*?\] "(?P<method>\S+) (?P<url>\S+) .*?" (?P<status>\d+) (?P<size>\d+) "(?P<referer>.*?)" "(?P<ua>.*?)"'

def convert_gz_logs(gz_file_path, output_csv_path):
    extracted_data = []
    
    # Read compressed .gz file directly
    with gzip.open(gz_file_path, 'rt', encoding='utf-8', errors='ignore') as f:
        for line in f:
            match = re.search(log_pattern, line)
            if match:
                data = match.groupdict()
                extracted_data.append({
                    'IP': data['ip'],
                    'Method': data['method'],
                    'URL': data['url'],
                    'lenght': int(data['size']) if data['size'].isdigit() else 0,
                    'User-Agent': data['ua'],
                    # Model compatibility fields (empty/default since raw logs don't store them)
                    'content-type': 'text/html',
                    'connection': 'keep-alive',
                    'content': '',
                    'cookie': ''
                })
    
    # Convert to DataFrame
    df = pd.DataFrame(extracted_data)
    
    # Save to CSV
    df.to_csv(output_csv_path, index=False)
    print(f"Success! Processed {len(df)} log lines and saved to {output_csv_path}")

# Usage: Apni .gz file ka naam yahan likho
convert_gz_logs('sslLog.gz', 'logs.csv')