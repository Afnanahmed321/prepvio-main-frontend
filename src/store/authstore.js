// src/store/authstore.js
import { create } from "zustand";
import { api } from "../lib/api";

const API_URL = "/auth";

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await api.post(`${API_URL}/signup`, { email, password, name });
            set({
                user: response.data.user,
                isAuthenticated: false,  // Not authenticated until verified
                isLoading: false,
                message: response.data.message
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error signing up",
                isLoading: false
            });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await api.post(`${API_URL}/login`, { email, password });

            // ❌ Removed Admin Redirect Logic to prevent 5173 -> 5174 auto-redirects
            // The backend should block admins with a 403 error.

            // ✅ Store user-specific token
            if (response.data.token) {
                localStorage.setItem("USER_AUTH_TOKEN", response.data.token);
            }
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error logging in",
                isLoading: false
            });
            throw error;
        }
    },

    // ✅ UPDATED LOGOUT FUNCTION - THE KEY FIX
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            console.log("🔄 Starting logout...");

            // Call backend logout to clear cookies
            await api.post(`${API_URL}/logout`);
            console.log("✅ Backend logout successful");

            // ✅ Clear local storage
            localStorage.removeItem("USER_AUTH_TOKEN");
            localStorage.clear();
            sessionStorage.clear();
            console.log("✅ Storage cleared");

            // ✅ Clear Zustand state
            set({
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
                message: null
            });
            console.log("✅ Frontend state cleared");

            return { success: true };
        } catch (error) {
            console.error("❌ Logout error:", error);

            // IMPORTANT: Still clear state even if API fails
            localStorage.removeItem("USER_AUTH_TOKEN");
            localStorage.clear();
            sessionStorage.clear();
            set({
                user: null,
                isAuthenticated: false,
                error: "Error logging out",
                isLoading: false,
                message: null
            });

            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/verify-email`, { code });
            if (response.data.token) {
                localStorage.setItem("USER_AUTH_TOKEN", response.data.token);
            }
            set({
                user: response.data.user,
                isAuthenticated: true,  // ✅ Now authenticated after verification
                isLoading: false
            });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error verifying email",
                isLoading: false
            });
            throw error;
        }
    },

    // ✅ UPDATED CHECKAUTH - Critical for preventing auto-login
    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });

        try {
            console.log("🔍 Checking authentication...");
            
            const response = await api.get(`${API_URL}/check-auth`);

            if (response.data.authenticated) {
                set({
                    user: response.data.user,
                    isAuthenticated: true,
                    isCheckingAuth: false,
                    error: null,
                });
                console.log("✅ User is authenticated");
                return true;
            } else {
                set({
                    user: null,
                    isAuthenticated: false,
                    isCheckingAuth: false,
                    error: null,
                });
                console.log("❌ User is not authenticated");
                return false;
            }
        } catch (error) {
            console.log("🔍 checkAuth failed (expected if not logged in):", error.message);
            
            // If 401 or network error, user is not authenticated
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
                error: null,
            });
            return false;
        }
    },

    refreshUser: async () => {
        try {
            const response = await api.get(`${API_URL}/check-auth`);
            set({ user: response.data.user });
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error sending reset password email",
            });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error resetting password",
            });
            throw error;
        }
    },

    clearMessage: () => set({ message: null, error: null }),
}));
