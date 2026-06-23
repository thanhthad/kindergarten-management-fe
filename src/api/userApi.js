import axiosClient from "./axiosClient";

export const userApi = {
  getById: (id) => axiosClient.get(`/users/${id}`),

  updateInfo: (id, data) =>
    axiosClient.put(`/users/${id}`, data),

  changePassword: (id, data) =>
    axiosClient.patch(`/users/${id}/password`, data),
};