import json

path = "data/Geopackage/bayarea_cities_with_codes.geojson"  # đổi thành đúng đường dẫn file geojson của bạn
with open(path, "r") as f:
    geo = json.load(f)

print("📍 Các cột trong properties:")
print(list(geo["features"][0]["properties"].keys()))

print("\n📄 Ví dụ nội dung 1 feature:")
print(json.dumps(geo["features"][0]["properties"], indent=2))
