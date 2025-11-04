import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${
        response.status
      }`
    );
    return response;
  },
  (error) => {
    // Better error logging
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    const errorData = error.response?.data || {};

    console.error("❌ Response Error:", {
      message: errorMessage,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: Object.keys(errorData).length > 0 ? errorData : undefined,
    });

    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.log("🔒 Unauthorized access");
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.log("🔥 Server error");
    }

    return Promise.reject(error);
  }
);

export default api;
