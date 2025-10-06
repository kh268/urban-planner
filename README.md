# Urban Planner — Bay Area Environmental Dashboard

**Urban Planner** is an integrated dashboard for monitoring and simulating urban environmental health across the Bay Area.  
It combines **satellite data**, **AI-based indicators**, and **interactive maps** to visualize how vegetation, air quality, and heat islands interact within cities — helping planners and researchers evaluate urban sustainability.

## Features

**Environmental Indicators**
- NDVI (Vegetation Index)
- Urban Heat Island (LST)
- Air Quality (AOD / PM2.5 Proxy)
- Population Density

**Scenario Planning**
- Simulate vegetation increase (NDVI ↑)  
  → Predict impacts on temperature (LST ↓) and air pollution (AOD ↓)

**Data Integration**
- Combines geospatial datasets from **NASA SEDAC**, **Copernicus GHSL**, **WorldPop**, and **US Census TIGER/Line**

**Interactive Map**
- Built with **React + Mapbox GL JS**
- Color-coded choropleth layers by metric
- Click any district to view its detailed metrics and projections

**Smart Backend (FastAPI)**
- Predictive model for NDVI ↔ LST/AOD relationships  
- Automatic entropy weighting for multi-factor “Hotspot” detection  
- REST APIs for dashboard and geospatial apps



