import json
import os
import pandas as pd

def load_geojson():
    """
    Load Bay Area GeoJSON boundaries and merge with metrics_summary.csv
    to return enriched GeoJSON for visualization.
    """

    # ✅ Base directory: urban-planner-backend/
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

    geo_path = os.path.join(base_dir, "data", "Geopackage", "bayarea_cities_with_codes.geojson")
    metrics_path = os.path.join(base_dir, "data", "metrics_summary.csv")

    if not os.path.exists(geo_path):
        raise FileNotFoundError(f"GeoJSON file not found at: {geo_path}")
    if not os.path.exists(metrics_path):
        raise FileNotFoundError(f"Metrics file not found at: {metrics_path}")

    # ✅ Load GeoJSON
    with open(geo_path, "r") as f:
        geo = json.load(f)

    # ✅ Load metrics CSV
    df = pd.read_csv(metrics_path)

    print("🗺️ GeoJSON properties keys:", list(geo["features"][0]["properties"].keys()))
    print("📊 Metrics columns:", list(df.columns))

    merged_count = 0
    total = len(geo["features"])

    # ✅ Match city_code_ ↔ city
    for f in geo["features"]:
        props = f["properties"]
        city_code = props.get("city_code_full")

        if not city_code:
            f["properties"]["_merged"] = False
            continue

        match = df[df["city"] == city_code]
        if not match.empty:
            f["properties"].update(match.iloc[-1].to_dict())
            f["properties"]["_merged"] = True
            merged_count += 1
        else:
            f["properties"]["_merged"] = False

    print(f"✅ Merged {merged_count}/{total} GeoJSON features successfully.")
    return geo
