import type { AppSettings } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081";

export async function fetchSettings(): Promise<AppSettings> {
  const response = await fetch(`${API_BASE}/api/settings`);
  if (!response.ok) {
    throw new Error("Failed to load settings from server");
  }

  const payload = await response.json();
  return payload.data;
}

export async function saveSettingsApi(settings: AppSettings): Promise<AppSettings> {
  const response = await fetch(`${API_BASE}/api/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error("Failed to save settings to server");
  }

  const payload = await response.json();
  return payload.data;
}
