import { ForecastResponse, HealthResponse } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function checkBackendHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`);
  }
  return res.json();
}

export async function requestForecast(sequence: number[][]): Promise<ForecastResponse> {
  if (sequence.length !== 10 || sequence.some(row => row.length !== 24)) {
    throw new Error(`Invalid sequence shape: expected (10, 24), got (${sequence.length}, ${sequence[0]?.length})`);
  }

  const res = await fetch(`${API_BASE}/forecast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ sequence }),
  });

  if (!res.ok) {
    let errMsg = `Inference failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json();
}
