  import axios from "axios";
  import { authService } from "./authService";

  const axiosClient = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // ================= REQUEST =================
  axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");

    const isPublic =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register") ||
      config.url?.includes("/auth/refresh");

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

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

      // chỉ xử lý 401 1 lần
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refreshToken");

        // ❌ KHÔNG CÓ REFRESH TOKEN
        if (!refreshToken) {
          authService.logout();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // nếu đang refresh → queue request lại
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          });
        }

        isRefreshing = true;

        try {
          const res = await axios.post(
            "http://localhost:8080/api/auth/refresh",
            { refreshToken }
          );

          const newAccessToken = res.data.data.accessToken;

          // lưu token mới
          localStorage.setItem("accessToken", newAccessToken);

          axiosClient.defaults.headers.Authorization =
            `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // retry request cũ
          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          return axiosClient(originalRequest);
        } catch (err) {
          // ❌ refresh token cũng chết
          processQueue(err, null);
          isRefreshing = false;

          authService.logout();
          window.location.href = "/login";

          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  export default axiosClient;