import pandas as pd
import numpy as np
import warnings
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from app.services.rules import apply_rules

warnings.filterwarnings("ignore", category=RuntimeWarning)

# ============================================================
# STEP 1. Compute base environmental indicators per city
# ============================================================
def compute_hotspots():
    """
    Load metrics_summary.csv (city-level data) and compute normalized indicators
    for NDVI (tree equity), LST (heat exposure), and AOD (air exposure).
    """
    path = "data/metrics_summary.csv"
    df = pd.read_csv(path)

    if df.empty:
        raise ValueError("⚠️ No data found in metrics_summary.csv")
    print("🧾 Columns found in CSV:", df.columns.tolist())
    print(df.head(3))

    # --- Chuẩn hóa tên cột ---
    df = df.rename(columns={
        "city_code_full": "district",
        "NDVI_mean": "ndvi",
        "LST_mean": "uhi",
        "AOD_mean": "aod",
        "population": "population"
    })

    # --- Compute derived indices ---
    df["Tree_Equity"] = df["ndvi"] / (df["population"] + 1e-5)
    df["Heat_Exposure"] = df["uhi"] * df["population"]
    df["Air_Exposure"] = df["aod"] * df["population"]

    # --- Normalize for comparison ---
    for col in ["Tree_Equity", "Heat_Exposure", "Air_Exposure"]:
        df[col] = np.log1p(df[col])
        df[col + "_norm"] = (
            (df[col] - df[col].min()) /
            (df[col].max() - df[col].min() + 1e-12)
        )

    # --- Apply rule-based recommendations ---
    df["recommendation"] = df.apply(apply_rules, axis=1)

    # --- Final format for frontend ---
    df = df[[
        "district",
        "ndvi",
        "uhi",
        "aod",
        "population",
        "Tree_Equity_norm",
        "Heat_Exposure_norm",
        "Air_Exposure_norm",
        "recommendation"
    ]].rename(columns={
        "Tree_Equity_norm": "tree_norm",
        "Heat_Exposure_norm": "heat_norm",
        "Air_Exposure_norm": "air_norm"
    })

    return df


# ============================================================
# STEP 2. Compute hybrid weights (Entropy + PCA)
# ============================================================
def compute_weights_entropy_pca(df):
    X = pd.DataFrame({
        "lack_tree": 1 - df["tree_norm"].fillna(0),
        "air": df["air_norm"].fillna(0),
        "heat": df["heat_norm"].fillna(0)
    }).replace(0, 1e-12)

    if (X.std() == 0).any():
        return {"final": {"lack_tree": 1/3, "air": 1/3, "heat": 1/3}}

    # --- Entropy weighting ---
    P = X.div(X.sum(axis=0), axis=1)
    k = 1.0 / np.log(len(X))
    entropy = -k * (P * np.log(P)).sum(axis=0)
    div = 1 - entropy
    w_entropy = div / div.sum()

    # --- PCA weighting ---
    X_scaled = StandardScaler().fit_transform(X)
    pca = PCA(n_components=1)
    pca.fit(X_scaled)
    loadings = np.abs(pca.components_[0])
    w_pca = loadings / loadings.sum()

    # --- Combine entropy + PCA ---
    w_final = (w_entropy.values + w_pca) / 2
    weights = dict(zip(X.columns, w_final))

    return {"final": weights}


# ============================================================
# STEP 3. Compute priority ranking per city
# ============================================================
def compute_priority_scores(df):
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
            w["lack_tree"] * (1 - group["tree_norm"]) +
            w["air"] * group["air_norm"] +
            w["heat"] * group["heat_norm"]
        )
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


# ============================================================
# STEP 4. Cross-city ranking (uses city_metrics.csv)
# ============================================================
def compute_city_priority_overall():
    path = "data/city_metrics.csv"
    df = pd.read_csv(path)
    if df.empty:
        raise ValueError("⚠️ No data found in city_metrics.csv")

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
