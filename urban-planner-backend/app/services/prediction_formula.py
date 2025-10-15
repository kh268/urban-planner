import pandas as pd

# Predict for a single district
def predict_ndvi_effect_formula(district: str, ndvi_delta_pct: float, mode: str = "formula"):
    """
    Predict how changes in NDVI affect LST and AOD
    using empirical sensitivity coefficients (Bay Area baseline).
    """

    # Empirical coefficients (Bay Area average from literature)
    alpha_LST = -0.45  # NDVI↑10% → LST↓~4.5%
    alpha_AOD = -0.80  # NDVI↑10% → AOD↓~8%

    # Read baseline metrics
    df = pd.read_csv("data/metrics_summary.csv")

    # If districts don't exist
    if district not in df["district"].unique():
        raise ValueError(f"District '{district}' not found in metrics_summary.csv")

    base = df[df["district"] == district].iloc[-1]  # lấy bản ghi mới nhất

    ndvi_from = base["NDVI_mean"]
    ndvi_to = ndvi_from * (1 + ndvi_delta_pct / 100.0)

    # Compute predicted changes
    dLST = alpha_LST * ndvi_delta_pct
    dAOD = alpha_AOD * ndvi_delta_pct

    LST_pred = base["LST_mean"] * (1 + dLST / 100.0)
    AOD_pred = base["AOD_mean"] * (1 + dAOD / 100.0)

    # Return structured JSON
    return {
        "district": district,
        "mode": mode,
        "assumption": {
            "ndvi_from": ndvi_from,
            "ndvi_to": ndvi_to,
            "ndvi_delta_pct": ndvi_delta_pct
        },
        "baseline": {
            "LST_mean": base["LST_mean"],
            "AOD_mean": base["AOD_mean"]
        },
        "scenario": {
            "LST_mean": LST_pred,
            "AOD_mean": AOD_pred
        },
        "predicted_change": {
            "dLST": dLST,
            "dAOD": dAOD
        },
        "coefficients": {
            "alpha_LST": alpha_LST,
            "alpha_AOD": alpha_AOD
        },
        "explanation": (
            f"An NDVI increase of {ndvi_delta_pct:.1f}% is expected to reduce "
            f"LST by {abs(dLST):.2f}% and AOD by {abs(dAOD):.2f}%, "
            "according to empirical sensitivity coefficients for Bay Area urban ecosystems."
        )
    }


#  Predict for ALL districts in the dataset
def predict_all_districts(ndvi_delta_pct: float, mode: str = "formula"):
    """
    Generate predictions for *all* districts simultaneously.
    Used for map visualization or dashboard overview.
    """

    df = pd.read_csv("data/metrics_summary.csv")
    districts = df["district"].unique()

    results = []
    for d in districts:
        try:
            results.append(
                predict_ndvi_effect_formula(district=d, ndvi_delta_pct=ndvi_delta_pct, mode=mode)
            )
        except Exception as e:
            results.append({
                "district": d,
                "error": str(e)
            })

    return results
