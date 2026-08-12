import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Determine base URL for API requests
const getBaseURL = () => {
  // Priority 1: Use VITE_API_URL environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL as string;
  }

  // Priority 2: In development with Vite, use /api prefix (proxied by Vite dev server)
  if (!import.meta.env.PROD) {
    return '/api';
  }

  // Priority 3: In production without VITE_API_URL, try same origin
  // This only works if frontend and backend are on the same domain
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

console.log('🔗 API Base URL:', getBaseURL());

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
