import pandas as pd
import numpy as np
import warnings
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from app.services.data_loader import load_metrics
from app.services.rules import apply_rules
from app.services.priority_loader import load_priority_metrics

warnings.filterwarnings("ignore", category=RuntimeWarning)


#1. Compute base environmental indicators per district

def compute_hotspots(month=None):
    df = load_metrics()
    if df.empty:
        raise ValueError("No city-level metrics found.")

    if month:
        df_latest = df[df["month"] == month].copy()
    else:
        df_latest = df.sort_values("month").groupby("city_code_full", as_index=False).last()

    if df_latest.empty:
        raise ValueError("No metrics found for the requested month.")

    df_latest["district"] = df_latest["city_code_full"]
    df_latest["city"] = df_latest["city"].astype(str)
    df_latest["county"] = df_latest["county"].astype(str)

    # Compute indices
    df_latest["Tree_Equity"] = df_latest["NDVI_mean"] / (df_latest["population"] + 1e-5)
    df_latest["Heat_Exposure"] = df_latest["LST_mean"] * df_latest["population"]
    df_latest["Air_Exposure"] = df_latest["AOD_mean"] * df_latest["population"]

    # Normalize (robust against zero division) 
    for col in ["Tree_Equity", "Heat_Exposure", "Air_Exposure"]:
        df_latest[col] = np.log1p(df_latest[col])  # smooth skew
        df_latest[col + "_norm"] = (
            (df_latest[col] - df_latest[col].min()) /
            (df_latest[col].max() - df_latest[col].min() + 1e-12)
        )

    # Apply rule-based recommendations
    df_latest["Recommendation"] = df_latest.apply(apply_rules, axis=1)
    return df_latest


# 2. Compute hybrid weights (Entropy + PCA)
def compute_weights_entropy_pca(df):
    X = pd.DataFrame({
        "lack_tree": 1 - df["Tree_Equity_norm"].fillna(0),
        "air": df["Air_Exposure_norm"].fillna(0),
        "heat": df["Heat_Exposure_norm"].fillna(0)
    }).replace(0, 1e-12)

    # If the data is totally similar
    if (X.std() == 0).any():
        return {
            "entropy": {"lack_tree": 1/3, "air": 1/3, "heat": 1/3},
            "pca": {"lack_tree": 1/3, "air": 1/3, "heat": 1/3},
            "final": {"lack_tree": 1/3, "air": 1/3, "heat": 1/3},
        }

    # Entropy 
    P = X.div(X.sum(axis=0), axis=1)
    k = 1.0 / np.log(len(X))
    entropy = -k * (P * np.log(P)).sum(axis=0)
    div = 1 - entropy
    w_entropy = div / div.sum()

    # PCA 
    X_scaled = StandardScaler().fit_transform(X)
    pca = PCA(n_components=1)
    pca.fit(X_scaled)
    loadings = np.abs(pca.components_[0])
    w_pca = loadings / loadings.sum()

    # Combine both 
    w_final = (w_entropy.values + w_pca) / 2
    weights = dict(zip(X.columns, w_final))

    return {
        "entropy": w_entropy.to_dict(),
        "pca": dict(zip(X.columns, w_pca)),
        "final": weights
    }



# 3. Compute priority per district & rank per city

def compute_priority_scores(df, month=None):
    if df.empty:
        raise ValueError("No input data provided to compute priority scores.")

    priority_df = load_priority_metrics()
    if priority_df.empty:
        raise ValueError("No priority input data found.")

    if month and "month" in priority_df.columns:
        latest_priority = priority_df[priority_df["month"] == month].copy()
    else:
        latest_priority = (
            priority_df.sort_values("month").groupby("city_code_full", as_index=False).last().copy()
        )

    if latest_priority.empty:
        latest_priority = (
            priority_df.sort_values("month").groupby("city_code_full", as_index=False).last().copy()
        )

    latest_priority["district"] = latest_priority["city_code_full"]

    latest_priority["Tree_Equity"] = latest_priority["NDVI"] / (
        latest_priority["population"] + 1e-5
    )
    latest_priority["Heat_Exposure"] = latest_priority["Heat exposure"]
    latest_priority["Air_Exposure"] = latest_priority["AOD"]

    for col in ["Tree_Equity", "Heat_Exposure", "Air_Exposure"]:
        latest_priority[f"{col}_norm"] = (
            latest_priority[col] - latest_priority[col].min()
        ) / (latest_priority[col].max() - latest_priority[col].min() + 1e-12)

    w = compute_weights_entropy_pca(latest_priority)["final"]
    latest_priority["Priority"] = (
        w["lack_tree"] * (1 - latest_priority["Tree_Equity_norm"].fillna(0))
        + w["air"] * latest_priority["Air_Exposure_norm"].fillna(0)
        + w["heat"] * latest_priority["Heat_Exposure_norm"].fillna(0)
    )
    latest_priority["city_weight_tree"] = w["lack_tree"]
    latest_priority["city_weight_air"] = w["air"]
    latest_priority["city_weight_heat"] = w["heat"]
    latest_priority["Priority_rank_city"] = latest_priority["Priority"].rank(ascending=False)

    df_all = latest_priority.merge(
        df[
            [
                "district",
                "city",
                "county",
                "month",
                "population",
                "NDVI_mean",
                "NDVI_change",
                "LST_mean",
                "LST_change",
                "AOD_mean",
                "AOD_change",
                "Recommendation",
            ]
        ],
        on="district",
        how="left",
        suffixes=("_priority", ""),
    )
    if "city" not in df_all.columns and "city_priority" in df_all.columns:
        df_all["city"] = df_all["city_priority"]
    if "county" not in df_all.columns and "county_priority" in df_all.columns:
        df_all["county"] = df_all["county_priority"]

    city_summary = (
        df_all[["city", "Priority"]]
        .sort_values("Priority", ascending=False)
        .reset_index(drop=True)
    )

    return df_all, city_summary


# 4. Compute cross-city ranking
def compute_city_priority_overall(month=None):
    df_all, _ = compute_priority_scores(compute_hotspots(month=month), month=month)
    df_all["Priority_rank_region"] = df_all["Priority"].rank(ascending=False)
    return df_all.sort_values("Priority_rank_region").reset_index(drop=True)
