import axiosClient from "./axiosClient";

export const studentApi = {
  // ================= SEARCH / GET ALL =================
  // GET /api/students?classId=&name=&address=&page=&size=
  search: (params) =>
    axiosClient.get("/students", { params }),

  // ================= GET ALL (explicit paging) =================
  getAll: (params) =>
    axiosClient.get("/students/getAll", { params }),

  // ================= GET BY ID =================
  getById: (id) =>
    axiosClient.get(`/students/${id}`),

  // ================= GET BY CLASS =================
  getByClass: (classId) =>
    axiosClient.get(`/students/class/${classId}`),

  // ================= CREATE =================
  create: (data) =>
    axiosClient.post("/students", data),

  // ================= UPDATE =================
  update: (id, data) =>
    axiosClient.put(`/students/${id}`, data),

  // ================= DELETE =================
  delete: (id) =>
    axiosClient.delete(`/students/${id}`),
};