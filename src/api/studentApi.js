import axiosClient from "./axiosClient";

export const studentApi = {
  getById: (id) => axiosClient.get(`/students/${id}`),

  create: (data) => axiosClient.post("/students", data),

  update: (id, data) => axiosClient.put(`/students/${id}`, data),

  getByClass: (classId) =>
    axiosClient.get(`/students/class/${classId}`),
};