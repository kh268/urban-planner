# app/routers/recommendations_router.py
from fastapi import APIRouter, HTTPException, Query
from app.services.rules import generate_recommendations

router = APIRouter()

@router.get("/recommendations")
def recommendations(district: str = Query(..., min_length=4), month: str | None = None):
    res = generate_recommendations(district_id=district, month=month)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res
