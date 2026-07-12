import type { FuelLog, Expense } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081";

export async function fetchFuelLogs(): Promise<FuelLog[]> {
  const response = await fetch(`${API_BASE}/api/costs/fuel`);
  if (!response.ok) throw new Error("Failed to fetch fuel logs");
  const payload = await response.json();
  return payload.data;
}

export async function createFuelLogApi(log: FuelLog): Promise<FuelLog> {
  const response = await fetch(`${API_BASE}/api/costs/fuel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });
  if (!response.ok) throw new Error("Failed to save fuel log");
  const payload = await response.json();
  return payload.data;
}

export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE}/api/costs/expenses`);
  if (!response.ok) throw new Error("Failed to fetch expenses");
  const payload = await response.json();
  return payload.data;
}

export async function createExpenseApi(expense: Expense): Promise<Expense> {
  const response = await fetch(`${API_BASE}/api/costs/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  if (!response.ok) throw new Error("Failed to save expense");
  const payload = await response.json();
  return payload.data;
}
