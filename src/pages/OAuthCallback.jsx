import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authstore";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Completing authentication...");

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Strategy 1: Extract token from URL query parameter
        const tokenFromUrl = searchParams.get("token");

        if (tokenFromUrl) {
          // Store token in localStorage
          localStorage.setItem("USER_AUTH_TOKEN", tokenFromUrl);

          // Clean URL to remove token from browser history (security)
          window.history.replaceState({}, document.title, "/auth/callback");

          setMessage("Token received, validating...");

          // Validate token and fetch user data
          await checkAuth();

          setStatus("success");
          setMessage("Login successful! Redirecting...");

          // Redirect to dashboard after short delay
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1500);

          return;
        }

        // Strategy 2: Check if backend set httpOnly cookie
        // Try to validate session via checkAuth (which uses cookies)
        setMessage("Validating session...");

        try {
          await checkAuth();

          // If checkAuth succeeds, user is authenticated via cookie
          setStatus("success");
          setMessage("Login successful! Redirecting...");

          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1500);

          return;
        } catch (authError) {
          // No valid token in URL and no valid cookie
          throw new Error("No authentication token found. Please try logging in again.");
        }

      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage(error.message || "Authentication failed. Please try again.");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, checkAuth]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDFBF9]"
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-t from-pink-50 to-transparent rounded-full blur-[120px] opacity-60" />
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white shadow-2xl shadow-gray-200/50 rounded-[2rem] p-8 text-center"
      >
        {status === "processing" && (
          <>
            <LoadingSpinner />
            <p className="mt-6 text-gray-700 font-semibold text-lg">{message}</p>
            <p className="mt-2 text-gray-500 text-sm">Please wait...</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <p className="mt-6 text-gray-900 font-bold text-xl">{message}</p>
            <p className="mt-2 text-gray-500 text-sm">Taking you to your dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"
            >
              <AlertCircle className="w-10 h-10 text-red-600" />
            </motion.div>
            <p className="mt-6 text-gray-900 font-bold text-xl">Authentication Failed</p>
            <p className="mt-2 text-red-600 text-sm font-medium">{message}</p>
            <p className="mt-4 text-gray-500 text-sm">Redirecting to login page...</p>
          </>
        )}
      </motion.div>

      {/* Debug Info (only in development) */}
      {import.meta.env.DEV && (
        <div className="mt-4 text-xs text-gray-400 text-center max-w-md">
          <p>Debug: Status = {status}</p>
          <p>Token in URL: {searchParams.get("token") ? "Yes" : "No"}</p>
        </div>
      )}
    </motion.div>
  );
};

export default OAuthCallback;
