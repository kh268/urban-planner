
# Urban Planner — Bay Area Environmental Dashboard

**Urban Planner** is an integrated dashboard designed to monitor and simulate urban environmental health across the Bay Area.
It combines **satellite data**, **AI-driven indicators**, and **interactive maps** to visualize the interactions between vegetation, air quality, and heat islands within cities. This tool helps urban planners and researchers evaluate the sustainability of urban environments.

---

## Features

### Environmental Indicators
- **NDVI** (Normalized Difference Vegetation Index) — Measures vegetation health
- **Urban Heat Island** (LST) — Tracks heat distribution within urban areas
- **Air Quality** (AOD / PM2.5 Proxy) — Monitors air pollution levels
- **Population Density** — Visualizes human population distribution

### Scenario Planning
- **Simulate Vegetation Increase** (NDVI ↑)
  → Predict impacts on temperature (LST ↓) and air pollution (AOD ↓)

### Data Integration
- Integrates geospatial datasets from leading sources:
  - **NASA SEDAC**
  - **GeoPackage**
  - **NASA MODIS**
  - **Copernicus GHSL**
  - **WorldPop**
  - **US Census TIGER/Line**

### Interactive Map
- Built with **React** + **Mapbox GL JS**
- **Color-coded choropleth layers** by metric
- Click on any district to view its detailed metrics and projections

### Smart Backend (FastAPI)
- **Predictive Model** for NDVI ↔ LST/AOD relationships
- **Automatic entropy weighting** for multi-factor “Hotspot” detection
- RESTful APIs for dashboard and geospatial applications

---

## System Architecture

```plaintext
urban-planner/
├── urban-planner-backend/      # FastAPI backend (data + ML logic)
│   ├── app/
│   │   ├── main.py            # Main API server
│   │   ├── services/          # Core analytics, prediction, and loaders
│   │   └── router/            # API routing structure
│   ├── data/                  # GeoJSON + metrics CSV
│   └── requirements.txt
│
├── urban-planner-frontend/     # React + Mapbox dashboard
│   ├── src/components/MapView.tsx
│   ├── src/services/api.ts
│   ├── vite.config.ts
│   ├── .env
│   └── build/ (after Vite build)
│
└── README.md

```

---

## Backend Setup (FastAPI)

### 1. Install Dependencies

```bash
cd urban-planner-backend
pip install -r requirements.txt

```

### 2. Run the Server

```bash
uvicorn app.main:app --reload

```

The backend will be available at:

[http://127.0.0.1:8000](http://127.0.0.1:8000/)

### 3. API Endpoints

| Endpoint | Description |
| --- | --- |
| `/api/health` | Check server status |
| `/api/hotspots` | Compute district-level environmental indices |
| `/api/predict/all` | Predict NDVI→LST/AOD changes for all districts |
| `/geojson` | Serve Bay Area boundaries (merged with metrics) |

---

## Frontend Setup (React + Vite)

### 1. Install Dependencies

```bash
cd urban-planner-frontend
npm install

```

### 2. Run in Development Mode

```bash
npm run dev

```

### 3. Build for Production

```bash
npm run build

```

Then serve the `build/` folder — FastAPI auto-serves it in production mode.

---

## Environment Variables

Create a `.env` file in `urban-planner-frontend/` with the following contents:

```
VITE_MAPBOX_TOKEN=kh268_mapbox_token_here
VITE_API_BASE_URL=http://127.0.0.1:8000

```

---

## Data Sources

| Dataset | Description | Source |
| --- | --- | --- |
| **GPWv4 / SEDAC** | Population Density | NASA CIESIN |
| **MODIS / MCD19A2** | Aerosol Optical Depth (AOD) | NASA GES DISC |
| **Copernicus GHSL** | Built-up Areas, Urban Extent | European Commission |
| **NLCD 2024** | Land Cover | USGS |
| **TIGER/Line 2023** | City Boundaries | US Census Bureau |

---

## Predictive Model: NDVI → LST & AOD

Model used in `app/services/prediction_formula.py`:

```
ΔLST = α_LST * ΔNDVI
ΔAOD = α_AOD * ΔNDVI

where:
α_LST = -0.45  # NDVI↑10% → LST↓~4.5%
α_AOD = -0.80  # NDVI↑10% → AOD↓~8.0%

```

These coefficients are derived from empirical Bay Area urban climate literature.

---

## Example API Call

```bash
curl -X POST http://127.0.0.1:8000/api/predict/ndvi_effect_formula \
-H "Content-Type: application/json" \
-d '{"district": "SF-001", "ndvi_delta_pct": 10}'

```

Response:

```json
{
  "district": "SF-001",
  "baseline": {"LST_mean": 27.5, "AOD_mean": 0.21},
  "scenario": {"LST_mean": 26.26, "AOD_mean": 0.19},
  "predicted_change": {"dLST": -4.5, "dAOD": -8.0}
}

```

---

## Contributors

- **Kien Han** ([@kh268](https://github.com/kh268)) — Data Science, ML, Math & Backend
- **Ngan Huong Nguyen** 
- **Linh Phuong Nguyen** 
- **Tinh Ta**
- **Thien Bui**

---

## License

MIT License © 2025 Kien Han

---

## Future Extensions

- Integrate **real-time PM2.5 feeds** (PurpleAir API)
- Use **LSTM regression** for NDVI–LST forecasting
- Add **Tree Equity & Heat Exposure indices**
- Deploy to **Render / Railway / AWS**
