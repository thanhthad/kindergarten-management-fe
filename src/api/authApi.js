import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => axiosClient.post("/auth/login", data),
  register: (data) => axiosClient.post("/auth/register", data),
  logout: (id) => axiosClient.post(`/auth/logout/${id}`),
  refresh: (data) => axiosClient.post("/auth/refresh", data),
};