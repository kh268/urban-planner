import { useEffect, useMemo, useState } from "react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { fetchGeoJson, predictNdviEffect, type HotspotRecord } from "../services/api";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

type DataLayer = "NDVI" | "UHI" | "AOD" | "Population" | null;

interface MapViewProps {
  selectedLayer: DataLayer;
  hotspots: HotspotRecord[];
  selectedDistrict?: string | null;
  onSelectDistrict?: (district: HotspotRecord) => void;
}

export function MapView({
  selectedLayer,
  hotspots,
  selectedDistrict = null,
  onSelectDistrict,
}: MapViewProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [mapMessage, setMapMessage] = useState<string | null>("Loading map data...");

  useEffect(() => {
    async function loadData() {
      try {
        const geo = await fetchGeoJson();

        if (!geo.features?.length) {
          setGeoData(null);
          setMapMessage(
            geo.metadata?.message ||
              "No district geometry is available yet. Add data/districts.geojson to draw map boundaries.",
          );
          return;
        }

        const mergedFeatures = geo.features.map((feature: any) => {
          const districtId = String(
            feature?.properties?.district ??
              feature?.properties?.district_id ??
              feature?.properties?.city_code_ ??
              feature?.properties?.code ??
              "",
          );

          const match = hotspots.find((item) => item.district === districtId);
          return {
            ...feature,
            properties: {
              ...(feature.properties || {}),
              ...(match || {}),
            },
          };
        });

        setGeoData({
          ...geo,
          features: mergedFeatures,
        });
        setMapMessage(null);
      } catch (error) {
        console.error("Failed to load map data", error);
        setGeoData(null);
        setMapMessage("Failed to load map data from the backend.");
      }
    }

    loadData();
  }, [hotspots]);

  const layerKey = useMemo(() => {
    switch (selectedLayer) {
      case "UHI":
        return "uhi";
      case "AOD":
        return "aod";
      case "Population":
        return "population";
      case "NDVI":
      default:
        return "ndvi";
    }
  }, [selectedLayer]);

  const selectedFeature = useMemo(() => {
    if (!geoData || !selectedDistrict) {
      return null;
    }
    return geoData.features.find(
      (feature: any) => feature?.properties?.district === selectedDistrict,
    );
  }, [geoData, selectedDistrict]);

  const fillPaint = useMemo(() => {
    const stops =
      selectedLayer === "UHI"
        ? [20, "#fff5f0", 25, "#fc9272", 30, "#99000d"]
        : selectedLayer === "AOD"
          ? [0.15, "#f7fbff", 0.22, "#6baed6", 0.3, "#08306b"]
          : selectedLayer === "Population"
            ? [50000, "#fcfbfd", 250000, "#9e9ac8", 1100000, "#3f007d"]
            : [0.45, "#f7fcf5", 0.55, "#74c476", 0.65, "#00441b"];

    return {
      "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", layerKey], 0], ...stops],
      "fill-opacity": 0.78,
      "fill-outline-color": "#ffffff",
    };
  }, [layerKey, selectedLayer]);

  return (
    <div className="relative h-full w-full">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -122.27,
          latitude: 37.8,
          zoom: 8.8,
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        interactiveLayerIds={geoData ? ["districts"] : []}
        onClick={async (event) => {
          const feature = event.features?.[0];
          const districtId = feature?.properties?.district;
          const match = hotspots.find((item) => item.district === districtId);

          if (!match) {
            return;
          }

          onSelectDistrict?.(match);

          try {
            const prediction = await predictNdviEffect(match.district, 10);
            console.log("Prediction result", prediction);
          } catch (error) {
            console.error("Prediction request failed", error);
          }
        }}
      >
        <NavigationControl position="top-right" />

        {geoData ? (
          <Source id="district-geometry" type="geojson" data={geoData}>
            <Layer id="districts" type="fill" paint={fillPaint} />
            <Layer
              id="district-borders"
              type="line"
              paint={{ "line-color": "#334155", "line-width": 0.8 }}
            />
          </Source>
        ) : null}

        {selectedFeature ? (
          <Source
            id="selected-district"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: [selectedFeature],
            }}
          >
            <Layer
              id="selected-district-outline"
              type="line"
              paint={{ "line-color": "#111827", "line-width": 2.5 }}
            />
          </Source>
        ) : null}
      </Map>

      {mapMessage ? (
        <div className="absolute left-4 top-4 max-w-md rounded-xl border border-amber-200 bg-white/95 p-4 text-sm text-slate-700 shadow-lg">
          <p className="font-semibold text-slate-900">Map geometry unavailable</p>
          <p className="mt-1">{mapMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
