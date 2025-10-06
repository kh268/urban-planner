import pandas as pd
from pathlib import Path

def load_city_metrics():
    csv_path = Path(__file__).resolve().parents[2] / "data" / "city_metrics.csv"
    df = pd.read_csv(csv_path)
    return df
