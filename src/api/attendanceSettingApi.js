import axiosClient from "./axiosClient";

export const attendanceSettingApi = {
  // ================= UPDATE SETTING =================
  // PUT /api/attendance-setting
  update: (data) =>
    axiosClient.put("/attendance-setting", data),
};