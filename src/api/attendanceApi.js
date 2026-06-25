import axiosClient from "./axiosClient";

export const attendanceApi = {
  // ================= INIT =================
  init: () =>
    axiosClient.post("/attendance"),

  // ================= UPDATE =================
  update: (id, data) =>
    axiosClient.put(`/attendance/${id}`, data),

  // ================= DELETE =================
  delete: (id) =>
    axiosClient.delete(`/attendance/${id}`),

  // ================= STUDENT HISTORY =================
  getStudentHistory: (studentId) =>
    axiosClient.get(`/attendance/student/${studentId}/history`),

  // ================= CLASS HISTORY =================
  getClassHistory: (classId, fromDate, toDate, params) =>
    axiosClient.get(`/attendance/class/history/${classId}`, {
      params: { fromDate, toDate, ...params },
    }),

  // ================= TEACHER SUMMARY =================
  getTeacherSummary: (teacherId, date) =>
    axiosClient.get("/attendance/teacher/summary", {
      params: { teacherId, date },
    }),

  // ================= GET DATES BY CLASS =================
  getDatesByClass: (classId) =>
    axiosClient.get(`/attendance/dates/class/${classId}`),

  // ================= SUMMARY BY CLASS =================
  getSummaryByClass: (classId, date) =>
    axiosClient.get(`/attendance/summary/class/${classId}`, {
      params: { date },
    }),

  // ================= CLASS ATTENDANCE =================
  getClassAttendance: (classId, date) =>
    axiosClient.get(`/attendance/class/${classId}`, {
      params: { date },
    }),

  // ================= GET ALL DATES =================
  getAllDates: () =>
    axiosClient.get("/attendance/dates"),

  // ================= GET BY DATE =================
  getByDate: (date) =>
    axiosClient.get("/attendance/date", {
      params: { date },
    }),

  // ================= SUMMARY BY DATE =================
  getSummaryByDate: (date) =>
    axiosClient.get("/attendance/summary/date", {
      params: { date },
    }),

  // ================= ATTENDANCE RATE =================
  getRate: (date) =>
    axiosClient.get("/attendance/rate", {
      params: { date },
    }),

  // ================= STUDENTS NOT YET ATTENDED =================
  getStudentsNotYet: (date, params) =>
    axiosClient.get("/attendance/students/not-yet", {
      params: { date, ...params },
    }),

  // ================= TOP ABSENT =================
  getTopAbsent: () =>
    axiosClient.get("/attendance/top-absent"),

  // ================= FILTER =================
  filter: (date, status, params) =>
    axiosClient.get("/attendance/filter", {
      params: { date, status, ...params },
    }),

  // ================= STUDENT STATISTIC =================
  getStudentStatistic: (studentId) =>
    axiosClient.get(`/attendance/student/${studentId}/statistic`),
};