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

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL,
  withCredentials: true,
});

// Initialize interceptors
attachToken(api, "USER_AUTH_TOKEN");
attachToken(adminApi, "ADMIN_AUTH_TOKEN");

