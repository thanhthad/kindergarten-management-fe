import axiosClient from "./axiosClient";

export const classApi = {
  getByTeacher: (teacherId) =>
    axiosClient.get(`/classes/teacher/${teacherId}`),
};