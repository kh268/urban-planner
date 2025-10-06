# app/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal
import traceback
import numpy as np

from app.services.hotspot import (
    compute_hotspots,
    compute_priority_scores,
    compute_city_priority_overall,
)
from app.services.prediction_formula import (
    predict_ndvi_effect_formula,
    predict_all_districts,
)

# =====================================================
# ⚙️ Initialize FastAPI app
# =====================================================
app = FastAPI(title="XanhInsights API")

# =====================================================
# 🌐 Core Endpoints
# =====================================================

@app.get("/")
def root():
    """Health check endpoint"""
    return {"message": "XanhInsights backend is running 🚀"}


@app.get("/hotspots")
def get_hotspots():
    """District-level environmental indices + rule-based recommendations"""
    try:
        df = compute_hotspots()
        df = df.replace([np.inf, -np.inf, np.nan], None)
        return df.to_dict(orient="records")
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


@app.get("/priority_auto")
def get_priority_auto():
    """District-level priority (within each city) using entropy + PCA weighting"""
    try:
        df = compute_hotspots()
        df_all, city_summary = compute_priority_scores(df)

        df_all = df_all.replace([np.inf, -np.inf, np.nan], None)
        city_summary = city_summary.replace([np.inf, -np.inf, np.nan], None)

        return {
            "city_ranking": city_summary.to_dict(orient="records"),
            "district_details": df_all[
                [
                    "city",
                    "district",
                    "Priority",
                    "city_weight_tree",
                    "city_weight_air",
                    "city_weight_heat",
                    "Priority_rank_city",
                ]
            ]
            .sort_values(["city", "Priority"], ascending=[True, False])
            .to_dict(orient="records"),
        }
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


@app.get("/priority_cities")
def get_priority_cities():
    """Cross-city priority (compare 9 cities overall)"""
    try:
        df_city = compute_city_priority_overall()
        df_city = df_city.replace([np.inf, -np.inf, np.nan], None)
        return df_city.to_dict(orient="records")
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


# =====================================================
# 🔮 Prediction Endpoint: NDVI → LST & AOD (Single District)
# =====================================================

class NDVIEffectFormulaIn(BaseModel):
    district: str
    ndvi_delta_pct: float
    mode: Literal["linear", "elasticity", "formula"] = "formula"

@app.post("/predict/ndvi_effect_formula")
def api_predict_ndvi_effect_formula(payload: NDVIEffectFormulaIn):
    """
    Predict how LST and AOD will change when NDVI changes by a certain percent.
    Mode:
      - "linear": ΔLST = b * ΔNDVI, ΔAOD = d * ΔNDVI
      - "elasticity": %ΔLST = e * %ΔNDVI, %ΔAOD = z * %ΔNDVI
      - "formula": use empirical coefficients α (default)
    """
    try:
        result = predict_ndvi_effect_formula(
            district=payload.district,
            ndvi_delta_pct=payload.ndvi_delta_pct,
            mode=payload.mode
        )
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# 🔮 Prediction Endpoint: All Districts
# =====================================================

@app.get("/predict/all")
def api_predict_all(ndvi_delta_pct: float = 10):
    """
    Return prediction results for all districts (for dashboard or map view).
    Example:
        /predict/all?ndvi_delta_pct=10
    """
    try:
        return predict_all_districts(ndvi_delta_pct=ndvi_delta_pct)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
