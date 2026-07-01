import axios from "axios";
import { toast } from "react-hot-toast";
import { authService } from "./authService";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST =================
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    const isPublic =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/refresh");

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= REFRESH STATE =================
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  queue = [];
};

// ================= RESPONSE =================
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url;

    const isAuthRequest =
      url?.includes("/auth/login") ||
      url?.includes("/auth/register") ||
      url?.includes("/auth/refresh");

    // ================= REFRESH TOKEN =================
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        authService.logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          { refreshToken }
        );

        const newAccessToken = response.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        axiosClient.defaults.headers.common.Authorization =
          `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        authService.logout();

        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ================= GLOBAL ERROR (KHÔNG APPLY LOGIN) =================
    if (!isAuthRequest) {
      const res = error?.response?.data;

      if (!res) {
        toast.error("Không thể kết nối tới máy chủ.");
      } else if (res.message) {
        toast.error(res.message);
      } else {
        toast.error("Đã xảy ra lỗi không xác định.");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;