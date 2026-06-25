import axiosClient from "./axiosClient";

export const classApi = {
  // ================= GET ALL (PAGING) =================
  // GET /api/classes?page=&size=&sort=
  getAll: (params) =>
    axiosClient.get("/classes", { params }),

  // ================= SEARCH =================
  // GET /api/classes/search?name=&status=&...
  search: (params) =>
    axiosClient.get("/classes/search", { params }),

  // ================= GET BY ID =================
  getById: (id) =>
    axiosClient.get(`/classes/${id}`),

  // ================= GET BY TEACHER =================
  getByTeacher: (teacherId) =>
    axiosClient.get(`/classes/teacher/${teacherId}`),

  // ================= CREATE =================
  create: (data) =>
    axiosClient.post("/classes", data),

  // ================= UPDATE =================
  update: (id, data) =>
    axiosClient.patch(`/classes/${id}`, data),

  // ================= DELETE =================
  delete: (id) =>
    axiosClient.delete(`/classes/${id}`),




  
  // ================= GET MY CLASS (JWT) =================
  getMyClass: () =>
    axiosClient.get("/classes/teacher/me"),
};