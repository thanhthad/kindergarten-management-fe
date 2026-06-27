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

// ================= SHOW ERROR HANDLER (NEW) =================
const showError = (error) => {
  const res = error?.response?.data;

  if (!res) {
    toast.error("Không thể kết nối tới máy chủ.");
    return;
  }

  // 1. Backend validation errors (field errors)
  if (res.data && typeof res.data === "object") {
    const fieldErrors = res.data;

    Object.values(fieldErrors).forEach((msg) => {
      toast.error(msg);
    });

    return;
  }

  // 2. Normal message
  if (res.message) {
    toast.error(res.message);
    return;
  }

  toast.error("Đã xảy ra lỗi không xác định.");
};

// ================= RESPONSE =================
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ================= 401 REFRESH TOKEN =================
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
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

        toast.error("Phiên đăng nhập đã hết hạn");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ================= USE NEW ERROR HANDLER =================
    showError(error);

    return Promise.reject(error);
  }
);

export default axiosClient;