# app/main.py

import json
import traceback
from pathlib import Path
from typing import Literal

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.data_loader import load_metrics
from app.services.data_loader_city import load_city_metrics
from app.services.hotspot import (
    compute_city_priority_overall,
    compute_hotspots,
    compute_priority_scores,
)
from app.services.prediction_formula import (
    predict_all_districts,
    predict_ndvi_effect_formula,
)

app = FastAPI(title="XanhInsights API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _project_root() -> Path:
    return Path(__file__).resolve().parents[1]


@app.get("/")
def root():
    return {"message": "XanhInsights backend is running"}


@app.get("/geojson")
def get_geojson():
    geojson_path = _project_root() / "data" / "districts.geojson"
    shapefile_path = (
        _project_root()
        / "data"
        / "bay_cities_shp"
        / "bay_cities_shp"
        / "bay_cities_shp.shp"
    )

    if not geojson_path.exists():
        if shapefile_path.exists():
            import geopandas as gpd
            gdf = gpd.read_file(shapefile_path).to_crs(epsg=4326)
            gdf["city"] = gdf["city_name"].astype(str).str.upper()
            gdf["district"] = gdf["city_code_"]
            gdf["geometry_level"] = "city"

            geojson = json.loads(gdf.to_json())
            geojson["metadata"] = {
                "geometry_available": True,
                "geometry_level": "city",
                "message": (
                    "Using bay_cities_shp city boundaries matched directly to "
                    "city_code_full in metrics_summary.csv."
                ),
            }
            return geojson

        return {
            "type": "FeatureCollection",
            "features": [],
            "metadata": {
                "geometry_available": False,
                "message": (
                    "District boundaries are missing. Add "
                    "urban-planner-backend/data/districts.geojson with a "
                    "'district' property matching metrics_summary.csv."
                ),
            },
        }

    with geojson_path.open("r", encoding="utf-8") as fh:
        geojson = json.load(fh)

    if "metadata" not in geojson:
        geojson["metadata"] = {"geometry_available": True}

    return geojson


@app.get("/hotspots")
@app.get("/api/hotspots")
def get_hotspots(month: str | None = None):
    try:
        df = compute_hotspots(month=month)
        df = df.replace([np.inf, -np.inf, np.nan], None)
        return df.to_dict(orient="records")
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


@app.get("/priority_auto")
@app.get("/api/priority_auto")
def get_priority_auto(month: str | None = None):
    try:
        df = compute_hotspots(month=month)
        df_all, city_summary = compute_priority_scores(df, month=month)

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
@app.get("/api/priority_cities")
def get_priority_cities():
    try:
        df_city = compute_city_priority_overall()
        df_city = df_city.replace([np.inf, -np.inf, np.nan], None)
        return df_city.to_dict(orient="records")
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


@app.get("/districts/{district}/history")
def get_district_history(district: str):
    df = load_metrics()
    district_df = (
        df[df["district"] == district]
        .sort_values("month")
        .replace([np.inf, -np.inf, np.nan], None)
    )
    if district_df.empty:
        raise HTTPException(status_code=404, detail=f"District '{district}' not found")
    return district_df.to_dict(orient="records")


@app.get("/filter_options")
def get_filter_options():
    metrics_df = load_metrics()
    city_metrics_df = load_city_metrics()

    city_metrics_has_usable_names = (
        {"code", "name", "month"}.issubset(city_metrics_df.columns)
        and city_metrics_df["code"].astype(str).str.contains("-").any()
    )

    if city_metrics_has_usable_names:
        city_options = (
            city_metrics_df[["code", "name"]]
            .drop_duplicates()
            .sort_values("name")
            .to_dict(orient="records")
        )
    else:
        city_options = (
            metrics_df[["city_code_full", "city"]]
            .drop_duplicates()
            .sort_values("city")
            .rename(columns={"city_code_full": "code", "city": "name"})
            .to_dict(orient="records")
        )

    month_sources = []
    if "month" in metrics_df.columns:
        month_sources.extend(metrics_df["month"].dropna().astype(str).unique().tolist())
    if "month" in city_metrics_df.columns:
        month_sources.extend(city_metrics_df["month"].dropna().astype(str).unique().tolist())
    months = sorted(set(month_sources))

    return {
        "cities": city_options,
        "months": months,
    }


class NDVIEffectFormulaIn(BaseModel):
    district: str
    ndvi_delta_pct: float
    mode: Literal["linear", "elasticity", "formula"] = "formula"


@app.post("/predict/ndvi_effect_formula")
def api_predict_ndvi_effect_formula(payload: NDVIEffectFormulaIn):
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


@app.get("/predict/all")
def api_predict_all(ndvi_delta_pct: float = 10):
    try:
        return predict_all_districts(ndvi_delta_pct=ndvi_delta_pct)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
