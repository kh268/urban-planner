# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Literal
import traceback
import numpy as np
import os

# =====================================================
# 🔧 Import internal modules
# =====================================================
from app.services.hotspot import (
    compute_hotspots,
    compute_priority_scores,
    compute_city_priority_overall,
)
from app.services.prediction_formula import (
    predict_ndvi_effect_formula,
    predict_all_districts,
)
from app.services.load_geojson import load_geojson  # ✅ GeoJSON loader

# =====================================================
# ⚙️ Initialize FastAPI app
# =====================================================
app = FastAPI(title="XanhInsights API")

# =====================================================
# 🌐 CORS (Cho phép frontend gọi API)
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc ["http://localhost:5173"] khi dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# 🌍 Core API Endpoints
# =====================================================

@app.get("/api/health")
def api_health():
    """Health check endpoint"""
    return {"message": "XanhInsights backend is running 🚀"}


@app.get("/api/hotspots")
def get_hotspots():
    """District-level environmental indices + rule-based recommendations"""
    try:
        df = compute_hotspots()
        df = df.replace([np.inf, -np.inf, np.nan], None)
        return df.to_dict(orient="records")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/priority_auto")
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
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/priority_cities")
def get_priority_cities():
    """Cross-city priority (compare 9 cities overall)"""
    try:
        df_city = compute_city_priority_overall()
        df_city = df_city.replace([np.inf, -np.inf, np.nan], None)
        return df_city.to_dict(orient="records")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🔮 Prediction Endpoint: NDVI → LST & AOD
# =====================================================

class NDVIEffectFormulaIn(BaseModel):
    district: str
    ndvi_delta_pct: float
    mode: Literal["linear", "elasticity", "formula"] = "formula"


@app.post("/api/predict/ndvi_effect_formula")
def api_predict_ndvi_effect_formula(payload: NDVIEffectFormulaIn):
    """Predict for one district"""
    try:
        result = predict_ndvi_effect_formula(
            district=payload.district,
            ndvi_delta_pct=payload.ndvi_delta_pct,
            mode=payload.mode,
        )
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/predict/all")
def api_predict_all(ndvi_delta_pct: float = 10):
    """Predict for all districts (for map overlay or dashboard)"""
    try:
        return predict_all_districts(ndvi_delta_pct=ndvi_delta_pct)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# 🗺️ GeoJSON Endpoint
# =====================================================
@app.get("/geojson")
def get_geojson():
    """Return Bay Area boundary in GeoJSON format"""
    try:
        geojson_str = load_geojson()
        return JSONResponse(content=geojson_str)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# 🧱 Serve React/Vite frontend build
# =====================================================
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../urban-planner-frontend/build"))
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"[⚠️] Frontend build folder not found at {frontend_path}")


# =====================================================
# 🔍 Debug route list (optional)
# =====================================================
if __name__ == "__main__":
    import uvicorn
    print("📋 Registered routes:")
    for route in app.routes:
        print("➡️", route.path, [method for method in route.methods])
    uvicorn.run(app, host="127.0.0.1", port=8000)
