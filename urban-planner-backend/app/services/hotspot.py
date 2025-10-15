import pandas as pd
import numpy as np
import warnings
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from app.services.data_loader import load_metrics
from app.services.rules import apply_rules
from app.services.data_loader_city import load_city_metrics

warnings.filterwarnings("ignore", category=RuntimeWarning)


#1. Compute base environmental indicators per district

def compute_hotspots():
    df = load_metrics()
    if df.empty:
        raise ValueError("No district-level metrics found.")

    # Get the latest record for each district
    df_latest = df.sort_values("month").groupby("district", as_index=False).last()

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

def compute_priority_scores(df):
    if df.empty:
        raise ValueError("No input data provided to compute priority scores.")

    results = []
    df["city"] = df["district"].apply(lambda x: str(x).split("-")[0])

    for city, group in df.groupby("city"):
        try:
            w = compute_weights_entropy_pca(group)["final"]
        except Exception as e:
            print(f"[WARN] Weight computation failed for {city}: {e}")
            w = {"lack_tree": 1/3, "air": 1/3, "heat": 1/3}

        group = group.copy()
        group["Priority"] = (
            w["lack_tree"] * (1 - group["Tree_Equity_norm"].fillna(0)) +
            w["air"] * group["Air_Exposure_norm"].fillna(0) +
            w["heat"] * group["Heat_Exposure_norm"].fillna(0)
        )
        group["city_weight_tree"] = w["lack_tree"]
        group["city_weight_air"] = w["air"]
        group["city_weight_heat"] = w["heat"]
        group["Priority_rank_city"] = group["Priority"].rank(ascending=False)
        results.append(group)

    df_all = pd.concat(results, ignore_index=True)

    city_summary = (
        df_all.groupby("city", as_index=False)["Priority"]
        .mean()
        .sort_values("Priority", ascending=False)
        .reset_index(drop=True)
    )

    return df_all, city_summary


# 4. Compute cross-city ranking
def compute_city_priority_overall():
    df = load_city_metrics()
    if df.empty:
        raise ValueError("No city-level data found.")

    # Calculate similar indicators to district-level
    df["Tree_Equity"] = df["NDVI_mean"] / (df["population"] + 1e-5)
    df["Heat_Exposure"] = df["LST_mean"] * df["population"]
    df["Air_Exposure"] = df["AOD_mean"] * df["population"]

    for col in ["Tree_Equity", "Heat_Exposure", "Air_Exposure"]:
        df[col] = np.log1p(df[col])
        df[col + "_norm"] = (df[col] - df[col].min()) / (df[col].max() - df[col].min() + 1e-12)

    w = compute_weights_entropy_pca(df)["final"]

    df["Priority"] = (
        w["lack_tree"] * (1 - df["Tree_Equity_norm"]) +
        w["air"] * df["Air_Exposure_norm"] +
        w["heat"] * df["Heat_Exposure_norm"]
    )
    df["Priority_rank_region"] = df["Priority"].rank(ascending=False)
    return df.sort_values("Priority_rank_region").reset_index(drop=True)
