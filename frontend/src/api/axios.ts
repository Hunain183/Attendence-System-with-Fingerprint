import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Determine base URL:
// - In development: use /api prefix (proxied by Vite)
// - In production (compiled exe): API is on same origin, no prefix needed
const getBaseURL = () => {
  // If VITE_API_URL is set, use it
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string;
  }

  // In production mode (built), prefer a configured backend domain.
  // If VITE_API_URL was not provided at build time (common when env not set),
  // fall back to the known backend domain to avoid same-origin 404s.
  if (import.meta.env.PROD) {
    return 'https://attendence-system-with-fingerprint-backend.vercel.app';
  }

  // In development, use /api prefix for Vite proxy
  return '/api';
};

// Create axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
