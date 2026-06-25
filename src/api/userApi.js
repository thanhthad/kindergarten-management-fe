import axiosClient from "./axiosClient";

export const userApi = {
  // GET /api/users/me
  getMe: () => axiosClient.get("/users/me"),

  // PUT /api/users
  updateInfo: (data) =>
    axiosClient.put("/users", data),

  // PATCH /api/users/password
  changePassword: (data) =>
    axiosClient.patch("/users/password", data),





  
  // GET /api/users?page=0&size=10
  getAll: (params) =>
    axiosClient.get("/users", { params }),

  // GET /api/users/{id}
  getById: (id) =>
    axiosClient.get(`/users/${id}`),

  // DELETE /api/users/{id}
  deleteUser: (id) =>
    axiosClient.delete(`/users/${id}`),

  // GET /api/users/search/fullname?keyword=abc
  searchByFullName: (keyword, params) =>
    axiosClient.get("/users/search/fullname", {
      params: { keyword, ...params },
    }),

  // GET /api/users/search/phone?phone=0123456789
  searchByPhone: (phone, params) =>
    axiosClient.get("/users/search/phone", {
      params: { phone, ...params },
    }),

  // GET /api/users/by-email?email=abc@gmail.com
  getByEmail: (email) =>
    axiosClient.get("/users/by-email", {
      params: { email },
    }),
};