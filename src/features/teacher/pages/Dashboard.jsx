import React, { useEffect, useState } from "react";
import { userApi } from "../../../api/userApi";
import { classApi } from "../../../api/classApi";
import { attendanceApi } from "../../../api/attendanceApi";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [myClass, setMyClass] = useState(null);
  const [summaryToday, setSummaryToday] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    Promise.all([
      userApi.getMe(),
      classApi.getMyClass(),
      attendanceApi.getTeacherSummaryMe(todayStr)
    ])
    .then(([userRes, classRes, summaryRes]) => {
      setUser(userRes.data.data);
      setMyClass(classRes.data.data);
      // Kết quả trả về là một mảng List<TeacherAttendanceSummaryResponse>, lấy phần tử đầu tiên của lớp mình phụ trách
      if (summaryRes.data.data && summaryRes.data.data.length > 0) {
        setSummaryToday(summaryRes.data.data[0]);
      }
    })
    .catch(err => console.error("Lỗi tải thông tin Dashboard", err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-12 text-slate-500">Đang khởi tạo Dashboard...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen max-w-6xl mx-auto space-y-6">
      {/* Khung Chào Mừng */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
        <h2 className="text-2xl font-bold">Xin chào, thầy/cô {user?.fullName || "Giáo Viên"}!</h2>
        <p className="text-blue-100 text-sm mt-1">Chúc thầy cô một ngày làm việc hiệu quả. Dưới đây là tình hình lớp học hôm nay.</p>
      </div>

      {/* Grid thông tin chi tiết */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* THÔNG TIN LỚP CHỦ NHIỆM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lớp Học Phụ Trách</h3>
          <div>
            <span className="text-xs text-slate-400">Tên lớp học</span>
            <p className="text-xl font-bold text-slate-800">{myClass?.name || "Chưa phân lớp"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-xs text-slate-400">Sĩ số hiện tại</span>
              <p className="text-lg font-semibold text-slate-700">{myClass?.currentStudents} HS</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Sức chứa tối đa</span>
              <p className="text-lg font-semibold text-slate-700">{myClass?.capacity} HS</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400">Mô tả</span>
            <p className="text-xs text-slate-500 italic mt-0.5">{myClass?.description || "Không có mô tả."}</p>
          </div>
        </div>

        {/* THỐNG KÊ KPI ĐIỂM DANH HÔM NAY */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Tổng Số Điểm Danh</span>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-slate-800">{summaryToday?.totalAttendance || 0}</p>
              <p className="text-xs text-slate-400 mt-1">Học sinh được rà soát</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-bold text-green-500 uppercase">Học Sinh Có Mặt</span>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-green-600">{summaryToday?.present || 0}</p>
              <p className="text-xs text-green-400 mt-1">Đang ở trên lớp</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
            <span className="text-xs font-bold text-red-500 uppercase">Học Sinh Vắng</span>
            <div className="mt-4">
              <p className="text-3xl font-extrabold text-red-500">{summaryToday?.absent || 0}</p>
              <p className="text-xs text-red-400 mt-1">Cần liên hệ phụ huynh</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;