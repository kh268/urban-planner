// src/components/MapView.tsx
import React, { useState, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchHotspots } from "../services/api";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const MapView: React.FC<{ selectedLayer: string }> = ({ selectedLayer }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("🌍 Loading GeoJSON + Hotspots...");

        // --- 1️⃣ Load GeoJSON boundaries ---
        const geoRes = await fetch(`${API_BASE_URL}/geojson`);
        if (!geoRes.ok) throw new Error("❌ Failed to load GeoJSON");
        const geo = await geoRes.json();
        console.log("🗺️ GeoJSON loaded:", geo);

        // --- 2️⃣ Load metrics data from backend ---
        const data = await fetchHotspots();
        console.log("🔥 Hotspot data (sample):", data.slice(0, 3));

        // --- 3️⃣ Merge metrics vào geojson ---
        geo.features.forEach((f: any) => {
          const props = f.properties || {};
          const match = data.find(
            (x: any) =>
              x.district === props.city_code ||
              x.district === props.code ||
              x.district === props.city
          );
          if (match) {
            f.properties = { ...props, ...match };
          }
        });

        console.log("✅ Merged feature example:", geo.features[0]?.properties);
        setGeoData(geo);
      } catch (err) {
        console.error("❌ Load map data failed:", err);
      }
    }

    loadData();
  }, []);

  // -------------------------------
  // 🎨 Màu gradient cho từng lớp
  // -------------------------------
  const colorStops: Record<string, string[]> = {
    NDVI: ["#f7fcf5", "#74c476", "#00441b"],          // xanh lá
    UHI: ["#fff5f0", "#fb6a4a", "#67000d"],           // đỏ
    AOD: ["#f7fbff", "#6baed6", "#08306b"],           // xanh dương
    Population: ["#fcfbfd", "#9e9ac8", "#3f007d"],    // tím
  };

  const getPaint = (layer: string) => {
    const key = layer?.toLowerCase() || "ndvi";
    const colors = colorStops[layer] || colorStops["NDVI"];

    return {
      "fill-color": [
        "interpolate",
        ["linear"],
        ["get", key],
        0, colors[0],
        0.5, colors[1],
        1, colors[2],
      ],
      "fill-opacity": 0.8,
      "fill-outline-color": "#ffffff",
    };
  };

  // -------------------------------
  // 🗺️ Render map
  // -------------------------------
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {!geoData ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontSize: "1.2rem",
            color: "#555",
          }}
        >
          🌀 Loading Bay Area Map...
        </div>
      ) : (
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: -122.27,
            latitude: 37.80,
            zoom: 9,
          }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          interactiveLayerIds={["districts"]}
          onClick={(e) => {
            const feature = e.features?.[0];
            if (feature) {
              setSelectedFeature(feature.properties);
              console.log("🟢 Selected feature:", feature.properties);

              // 👉 Khi click vào district, gọi backend predict
              fetch(`${API_BASE_URL}/predict/ndvi_effect_formula`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  district: feature.properties.district,
                  ndvi_delta_pct: 10,
                }),
              })
                .then((res) => res.json())
                .then((pred) => {
                  console.log("🌿 Prediction result:", pred);
                  alert(
                    `📍 ${feature.properties.city || feature.properties.district}\n` +
                      `NDVI +10% → LST ↓${Math.abs(pred.predicted_change.dLST)}%, AOD ↓${Math.abs(pred.predicted_change.dAOD)}%`
                  );
                })
                .catch((err) => console.error("❌ Prediction failed:", err));
            }
          }}
        >
          <Source id="bayarea" type="geojson" data={geoData}>
            <Layer id="districts" type="fill" paint={getPaint(selectedLayer)} />
            <Layer id="borders" type="line" paint={{ "line-color": "#333", "line-width": 0.6 }} />
          </Source>
        </Map>
      )}
    </div>
  );
};
