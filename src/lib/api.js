import axios from "axios";

// Request interceptor to attach tokens
const attachToken = (instance, tokenKey) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Base URLs are appended with /api for consistency with backend routing
const BASE_URL = import.meta.env.VITE_API_URL;
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});

export const adminApi = axios.create({
  baseURL: `${ADMIN_BASE_URL}/api`,
  withCredentials: true,
});

// Initialize interceptors
attachToken(api, "USER_AUTH_TOKEN");
attachToken(adminApi, "ADMIN_AUTH_TOKEN");
