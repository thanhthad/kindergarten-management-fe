import axiosClient from "./axiosClient";

export const attendanceApi = {

  // ================= INIT =================
  init: () =>
    axiosClient.post("/attendance"),

  // ================= STUDENT STATISTIC =================
  getStudentStatistic: (studentId) =>
    axiosClient.get(`/attendance/student/${studentId}/statistic`),

  getClassAttendance: (date) =>
  axiosClient.get(`/attendance/class/${date}`),

  // ================= STUDENT HISTORY =================
  getStudentHistory: (studentId) =>
  axiosClient.get(`/attendance/student/${studentId}/history`),

  // ================= TEACHER SUMMARY ME =================
  getTeacherSummaryMe: (date) =>
    axiosClient.get("/attendance/teacher/summary/me", {
      params: { date },
    }),

    // ================= GET DATES BY CLASS =================
  getDatesByClass: () =>
    axiosClient.get("/attendance/dates/class/me"),

  // ================= UPDATE =================
  update: (id, data) =>
    axiosClient.put(`/attendance/${id}`, data),

  batchUpdate: (data) =>
    axiosClient.put("/attendance/batch", data),




  // ================= TEACHER SUMMARY =================
  getTeacherSummary: (teacherId, date) =>
    axiosClient.get("/attendance/teacher/summary", {
      params: { teacherId, date },
    }),

  // ================= SUMMARY BY CLASS =================
  getSummaryByClass: (classId, date) =>
    axiosClient.get(`/attendance/summary/class/${classId}`, {
      params: { date },
    }),

  // ================= DELETE =================
  delete: (id) =>
    axiosClient.delete(`/attendance/${id}`),

  // ================= GET ALL DATES =================
  getAllDates: () =>
    axiosClient.get("/attendance/dates"),

  // ================= GET BY DATE =================
  getByDate: (date, params) =>
    axiosClient.get("/attendance/date", {
      params: { date, ...params },
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

  // ================= CLASS HISTORY =================
  getClassHistory: (classId, fromDate, toDate, params) =>
    axiosClient.get(`/attendance/class/history/${classId}`, {
      params: { fromDate, toDate, ...params },
    }),
};