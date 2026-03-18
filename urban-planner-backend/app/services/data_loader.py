import pandas as pd
from pathlib import Path

def load_metrics():
    csv_path = Path(__file__).resolve().parents[2] / "data" / "metrics_summary.csv"
    df = pd.read_csv(csv_path)
    if "district" not in df.columns and "city_code_full" in df.columns:
        df["district"] = df["city_code_full"]
    return df
