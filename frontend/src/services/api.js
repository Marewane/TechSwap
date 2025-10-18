// src/services/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token automatically (reads from localStorage)
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth"); // we'll store { user, tokens }
  if (raw) {
    try {
      const auth = JSON.parse(raw);
      if (auth?.tokens?.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${auth.tokens.accessToken}`;
      }
    } catch (e) {}
  }
  return config;
}, (err) => Promise.reject(err));

export default api;
