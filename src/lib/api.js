import axios from "axios";

// ============================================
// AXIOS INTERCEPTOR: Attach Auth Token
// ============================================
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

// ============================================
// API CONFIGURATION
// ============================================

// Get base URLs from environment variables
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:5174";

console.log("🔧 API Configuration:");
console.log("   BASE_URL:", BASE_URL);
console.log("   ADMIN_BASE_URL:", ADMIN_BASE_URL);

// ============================================
// CREATE AXIOS INSTANCES
// ============================================

// ✅ USER API - For regular user endpoints
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,  // ✅ Important: /api prefix
  withCredentials: true,       // ✅ Important: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ ADMIN API - For admin endpoints
export const adminApi = axios.create({
  baseURL: `${ADMIN_BASE_URL}/api`,  // ✅ Important: /api prefix
  withCredentials: true,              // ✅ Important: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// RESPONSE INTERCEPTORS (Handle errors)
// ============================================

// User API Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔴 API Error:", error.response?.status, error.response?.data?.message);

    // Handle 401 Unauthorized - User not authenticated
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized (401) - User not authenticated");
      // Clear auth token if API says it's invalid
      localStorage.removeItem("USER_AUTH_TOKEN");
      // Optional: Redirect to login
      // window.location.href = "/login";
    }

    // Handle 403 Forbidden - User doesn't have permission
    if (error.response?.status === 403) {
      console.warn("⚠️ Forbidden (403) - No permission");
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("❌ Endpoint not found (404)");
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("❌ Server error (500)");
    }

    return Promise.reject(error);
  }
);

// Admin API Response Interceptor
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🔴 Admin API Error:", error.response?.status, error.response?.data?.message);

    if (error.response?.status === 401) {
      console.warn("⚠️ Admin unauthorized (401)");
      localStorage.removeItem("ADMIN_AUTH_TOKEN");
    }

    return Promise.reject(error);
  }
);

// ============================================
// ATTACH TOKEN INTERCEPTORS
// ============================================

// Attach USER token to user API requests
attachToken(api, "USER_AUTH_TOKEN");

// Attach ADMIN token to admin API requests
attachToken(adminApi, "ADMIN_AUTH_TOKEN");

// ============================================
// REQUEST INTERCEPTORS (Log requests)
// ============================================

api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.request.use(
  (config) => {
    console.log(`📤 [ADMIN] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// EXPORT
// ============================================

export default api;
