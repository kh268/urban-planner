# app/routers/scenario_router.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
from app.services.data_loader import load_monthlies
from app.services.rules import generate_recommendations
from app.services.hotspot import _minmax  # reused
import numpy as np

router = APIRouter()

class ScenarioBody(BaseModel):
    district: str = Field(..., description="e.g., SF-001")
    month: str | None = Field(None, description="YYYY-MM; if None, apply to the most recent month")
    NDVI: str | None = Field(None, description="+10% or -5%")
    LST:  str | None = Field(None, description="+/-x%")
    AOD:  str | None = Field(None, description="+/-x%")

def _parse_pct(s: str | None) -> float:
    if not s: return 0.0
    s = s.strip().replace("%", "")
    return float(s) / 100.0

@router.post("/scenario")
def scenario(body: ScenarioBody):
    df_all = load_monthlies().copy()
    df = df_all[df_all["district_id"] == body.district].copy()
    if df.empty:
        raise HTTPException(404, f"No data for district {body.district}")

    # Select the target month
    if body.month is None:
        month = sorted(df["month"].unique())[-1]
    else:
        month = body.month

    if month not in set(df["month"]):
        raise HTTPException(404, f"No data for {body.district} in month {month}")

    # Baseline snapshot
    base = df[df["month"] == month].iloc[0][["NDVI_mean", "LST_mean", "AOD_mean", "population"]].to_dict()

    # Apply percentage changes
    d_ndvi = _parse_pct(body.NDVI)
    d_lst  = _parse_pct(body.LST)
    d_aod  = _parse_pct(body.AOD)

    scen = df_all.copy()
    m_mask = (scen["district_id"] == body.district) & (scen["month"] == month)
    if d_ndvi:
        scen.loc[m_mask, "NDVI_mean"] = np.clip(scen.loc[m_mask, "NDVI_mean"] * (1 + d_ndvi), 0.0, 1.0)
    if d_lst:
        scen.loc[m_mask, "LST_mean"]  = scen.loc[m_mask, "LST_mean"] * (1 + d_lst)
    if d_aod:
        scen.loc[m_mask, "AOD_mean"]  = scen.loc[m_mask, "AOD_mean"] * (1 + d_aod)

    # Compute risk before and after (min-max normalized by month)
    def risk(df):
        tmp = df.copy()
        tmp["NDVI_norm"] = tmp.groupby("month")["NDVI_mean"].transform(_minmax)
        tmp["LST_norm"]  = tmp.groupby("month")["LST_mean"].transform(_minmax)
        tmp["AOD_norm"]  = tmp.groupby("month")["AOD_mean"].transform(_minmax)
        tmp["POP_norm"]  = tmp.groupby("month")["population"].transform(_minmax)
        tmp["risk"] = (
            (1 - tmp["NDVI_norm"]) * 0.35
            + tmp["AOD_norm"] * 0.30
            + tmp["LST_norm"] * 0.25
            + tmp["POP_norm"] * 0.10
        )
        return tmp

    r0 = risk(df_all)
    r1 = risk(scen)

    r0_val = float(r0[(r0["district_id"] == body.district) & (r0["month"] == month)]["risk"].iloc[0])
    r1_val = float(r1[(r1["district_id"] == body.district) & (r1["month"] == month)]["risk"].iloc[0])

    # Generate new recommendations
    rec_new = generate_recommendations(district_id=body.district, month=month)

    return {
        "district": body.district,
        "month": month,
        "baseline_metrics": base,
        "scenario_delta": {"NDVI": d_ndvi, "LST": d_lst, "AOD": d_aod},
        "risk_baseline": round(r0_val, 4),
        "risk_scenario": round(r1_val, 4),
        "risk_change": round(r1_val - r0_val, 4),
        "recommendations_after": rec_new.get("recommendations", []),
    }
