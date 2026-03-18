import pandas as pd
from pathlib import Path

def load_city_metrics():
    csv_path = Path(__file__).resolve().parents[2] / "data" / "city_metrics.csv"
    df = pd.read_csv(csv_path)
    if "code" not in df.columns:
        if "city_code_full" in df.columns:
            df["code"] = df["city_code_full"]
        elif "city" in df.columns:
            df["code"] = df["city"]

    if "name" not in df.columns and "city" in df.columns:
        df["name"] = df["city"]
    return df
