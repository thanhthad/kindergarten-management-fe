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
  queue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  queue = [];
};

// ================= RESPONSE =================
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ================= 401 => REFRESH TOKEN =================
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem("refreshToken");

      // Không có refresh token
      if (!refreshToken) {
        authService.logout();
        window.location.href = "/login";

        return Promise.reject(error);
      }

      // Đang refresh => đưa request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;

          return axiosClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          {
            refreshToken,
          }
        );

        const newAccessToken =
          response.data.data.accessToken;

        localStorage.setItem(
          "accessToken",
          newAccessToken
        );

        axiosClient.defaults.headers.common.Authorization =
          `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        authService.logout();

        toast.error(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );

        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ================= BUSINESS ERROR =================
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    }

    // ================= NETWORK ERROR =================
    else if (error.request) {
      toast.error(
        "Không thể kết nối tới máy chủ."
      );
    }

    // ================= UNKNOWN ERROR =================
    else {
      toast.error(
        "Đã xảy ra lỗi không xác định."
      );
    }

    return Promise.reject(error);
  }
);

export default axiosClient;