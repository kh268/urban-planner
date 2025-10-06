const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchHotspots() {
  const res = await fetch(`${API_BASE_URL}/api/hotspots`);
  if (!res.ok) {
    throw new Error(`Failed to fetch hotspots: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPriorityAuto() {
  const res = await fetch(`${API_BASE_URL}/api/priority_auto`);
  if (!res.ok) {
    throw new Error(`Failed to fetch priority_auto: ${res.statusText}`);
  }
  return res.json();
}
