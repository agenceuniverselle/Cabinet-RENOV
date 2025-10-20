export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export async function apiFetch(input: string, init: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${API_URL}${input.startsWith('/') ? '' : '/'}${input}`, {
    ...init,
    headers,
  });
}