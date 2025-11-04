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
  const raw = localStorage.getItem("auth");
  if (raw) {
    try {
      const auth = JSON.parse(raw);
      if (auth?.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${auth.tokens.accessToken}`;
      }
    } catch (e) {
      console.error("Error parsing auth data:", e);
    }
  }
  return config;
}, (err) => Promise.reject(err));

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;