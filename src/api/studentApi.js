import axiosClient from "./axiosClient";

export const studentApi = {

  
// do sử dụng userId từ jwtoken nên chỉ cần sử dụng api thôi là tự động map với id của mình 
// ================= GET BY ID =================
  getById: (id) =>
    axiosClient.get(`/students/${id}`),

  // ================= GET CURRENT USER'S CLASS =================
  getMyClass: () =>
    axiosClient.get("/students/class/me"),

  // ================= CREATE =================
  create: (data) =>
    axiosClient.post("/students", data),

  // ================= UPDATE =================
  update: (id, data) =>
    axiosClient.put(`/students/${id}`, data),



  
  // ================= SEARCH / GET ALL =================
  // GET /api/students?classId=&name=&address=&page=&size=
  search: (params) =>
    axiosClient.get("/students", { params }),

  
  // ================= GET BY CLASS =================
  getByClass: (classId) =>
    axiosClient.get(`/students/class/${classId}`),
  
  // ================= DELETE =================
  delete: (id) =>
    axiosClient.delete(`/students/${id}`),

  // // ================= BULK CREATE =================
  // bulkCreate: (data) =>
  //   axiosClient.post("/students/bulk", data),


};