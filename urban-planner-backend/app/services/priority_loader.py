import pandas as pd
from pathlib import Path


def load_priority_metrics():
    csv_path = Path(__file__).resolve().parents[2] / "data" / "priority.csv"
    return pd.read_csv(csv_path)
