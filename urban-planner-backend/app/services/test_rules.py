import pandas as pd
from app.services.hotspot import compute_hotspots
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
def test_compute_hotspots_basic():
    """Basic sanity test for hotspot computation."""
    df = compute_hotspots()

    # 1️ Check if DataFrame exist
    assert isinstance(df, pd.DataFrame), "Output must be a DataFrame"

    # 2️ Check neccessary collumns
    expected_cols = {"district", "Tree_Equity", "Heat_Exposure", "Air_Exposure", "Recommendation"}
    missing = expected_cols - set(df.columns)
    assert not missing, f"Missing columns: {missing}"

    # 3️ Check the basic reccommendations
    row = df.iloc[0]
    rec = row["Recommendation"]
    assert isinstance(rec, str) and len(rec) > 0, "Recommendation should be a non-empty string"

    print(" Test passed: compute_hotspots() returns valid structure and recommendations.")
    print(df[["district", "Recommendation"]].head())
