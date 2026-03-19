import axios from "axios";
import { API_BASE_URL, LOCAL_DATA_STORE } from "../utils/constants";
import {
  getLocalStorageItem,
  logoutUser,
  removeAllLocalStorageItems,
  setLocalStorageItem,
} from "../utils/helpers";

/**
 * Axios instance for API requests
 */
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];
let isLoggingOut = false;

/**
 * Process the queue of failed requests when a new token is obtained
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/* ───────── Request Interceptor ───────── */

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getLocalStorageItem(LOCAL_DATA_STORE.JWT_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ───────── Response Interceptor ───────── */

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (isLoggingOut) {
      return Promise.reject(error);
    }

    /* Avoid infinite refresh loop if call to /auth/refresh itself fails with 401 */
    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    /* Do not trigger refresh/logout logic for login attempts */
    if (originalRequest?.url?.includes("/auth/admin-login")) {
      return Promise.reject(error);
    }

    /* ── Handle Session Expired (440) ── */
    if (error.response?.status === 440) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        removeAllLocalStorageItems();
        // We use window.location because we are outside of React routing context here
        window.location.href = "/login?session=expired";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend handles refresh token via cookies, so no body is needed
        const response = await axiosInstance.post("/auth/refresh");
        const newAccessToken = response.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("Failed to obtain new access token");
        }

        setLocalStorageItem(LOCAL_DATA_STORE.JWT_TOKEN, newAccessToken);

        // Update default header for future requests
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);

        if (!isLoggingOut) {
          isLoggingOut = true;
          logoutUser()
          window.location.href = "/login";
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
