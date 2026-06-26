import React, { useEffect, useState } from "react";
import { studentApi } from "../../../api/studentApi";
import { attendanceApi } from "../../../api/attendanceApi";
import toast from "react-hot-toast";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  // States lưu thông tin chi tiết của học sinh đang chọn
  const [profile, setProfile] = useState(null);
  const [statistic, setStatistic] = useState(null);
  const [historyPage, setHistoryPage] = useState({ content: [], totalPages: 0, number: 0 });
  
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 1. Tải danh sách học sinh của lớp giáo viên phụ trách đổ vào Sidebar
  useEffect(() => {
    setLoadingList(true);
    studentApi.getMyClass()
      .then(res => {
        if (res.data?.success) {
          const list = res.data.data || [];
          setStudents(list);
          if (list.length > 0) setSelectedStudentId(list[0].id); // Chọn học sinh đầu tiên mặc định
        }
      })
      .catch(() => toast.error("Không thể tải danh sách lớp học"))
      .finally(() => setLoadingList(false));
  }, []);

  // 2. Chạy Parallel Fetching 3 API song song khi click đổi học sinh hoặc đổi trang lịch sử
  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId, currentPage);
    }
  }, [selectedStudentId, currentPage]);

  const fetchStudentData = async (studentId, page) => {
    setLoadingDetail(true);
    try {
      const [profileRes, statRes, historyRes] = await Promise.all([
        studentApi.getById(studentId),
        attendanceApi.getStudentStatistic(studentId),
        attendanceApi.getStudentHistory(studentId, { page, size: 5 })
      ]);

      if (profileRes.data?.success) setProfile(profileRes.data.data);
      if (statRes.data?.success) setStatistic(statRes.data.data);
      if (historyRes.data?.success) {
        // Backend trả về nguyên cục Page object bọc trong data của ResponseData.success
        const pageData = historyRes.data.data;
        setHistoryPage({
          content: pageData?.content || [],
          totalPages: pageData?.totalPages || 0,
          number: pageData?.number || 0
        });
      }
    } catch (err) {
      console.error("Lỗi song song tải thông tin:", err);
      toast.error("Lỗi trích xuất hồ sơ chuyên cần chuyên sâu");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Tính toán chỉ số nghiệp vụ chuyên cần
  const totalDays = (statistic?.presentDays || 0) + (statistic?.absentDays || 0);
  const absentRate = totalDays > 0 ? ((statistic.absentDays / totalDays) * 100).toFixed(1) : 0;
  const isDanger = absentRate > 20;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR BÊN TRÁI: DANH SÁCH HỌC SINH */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Học Sinh Lớp Chủ Nhiệm</h3>
          <p className="text-xs text-slate-400 mt-0.5">Tổng số: {students.length} nhân sự</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingList ? (
            <div className="text-center py-6 text-sm text-slate-400 animate-pulse">Đang định hình lớp học...</div>
          ) : (
            students.map(st => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStudentId(st.id);
                  setCurrentPage(0); // Reset về trang lịch sử đầu tiên
                }}
                className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                  selectedStudentId === st.id 
                    ? "bg-slate-900 text-white font-semibold shadow-md shadow-slate-900/10" 
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="truncate text-sm">{st.fullName}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${selectedStudentId === st.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                  #{st.id}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* VÙNG CHI TIẾT BÊN PHẢI: CHI TIẾT & CHUYÊN CẦN NÂNG CAO */}
      <div className="flex-1 overflow-y-auto p-6">
        {loadingDetail && !profile ? (
          <div className="text-center py-20 text-slate-500 font-medium">Đang bóc tách dữ liệu song song...</div>
        ) : profile ? (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            {/* THỐNG KÊ CHUYÊN CẦN THÔNG MINH */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày Có Mặt</span>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{statistic?.presentDays || 0} <span className="text-sm font-normal text-slate-400">ngày</span></p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày Vắng Mặt</span>
                <p className="text-3xl font-bold text-rose-600 mt-1">{statistic?.absentDays || 0} <span className="text-sm font-normal text-slate-400">ngày</span></p>
              </div>
              
              {/* CHỈ BÁO NGUY HIỂM TỰ ĐỘNG KHỞI CHẠY */}
              <div className={`p-5 rounded-2xl shadow-sm border transition-all ${
                isDanger ? "bg-rose-50 border-rose-100 animate-pulse" : "bg-white border-slate-100"
              }`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ Lệ Vắng Nghỉ</span>
                <p className={`text-3xl font-bold mt-1 ${isDanger ? "text-rose-600" : "text-slate-800"}`}>
                  {absentRate}%
                </p>
                {isDanger && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                    ⚠️ Nguy hiểm! Vượt ngưỡng 20%
                  </span>
                )}
              </div>
            </div>

            {/* HỒ SƠ LÝ LỊCH CÁ NHÂN */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-md font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Hồ Sơ Lý Lịch Học Sinh</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Họ và tên:</span> <strong className="text-slate-800">{profile.fullName}</strong></div>
                <div><span className="text-slate-400">Giới tính:</span> <span className="font-medium text-slate-700">{profile.gender}</span></div>
                <div><span className="text-slate-400">Ngày sinh:</span> <span className="font-medium text-slate-700">{profile.dateOfBirth}</span></div>
                <div><span className="text-slate-400">Lớp hiện tại:</span> <span className="font-medium text-slate-700">{profile.className}</span></div>
                <div><span className="text-slate-400">Phụ huynh đại diện:</span> <span className="font-medium text-slate-700">{profile.parentName}</span></div>
                <div><span className="text-slate-400">SĐT liên hệ:</span> <span className="font-mono text-slate-700">{profile.parentPhone || "Chưa cập nhật"}</span></div>
                <div className="sm:col-span-2"><span className="text-slate-400">Địa chỉ cư trú:</span> <span className="font-medium text-slate-700">{profile.address}</span></div>
              </div>
            </div>

            {/* BẢNG LỊCH SỬ CHUYÊN CẦN PHÂN TRANG */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-md font-bold text-slate-800 mb-4">Lịch Sử Điểm Danh Chi Tiết</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-xl mb-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="p-3">Ngày Học</th>
                      <th className="p-3">Trạng Thái</th>
                      <th className="p-3">Ghi Chú Hệ Thống</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {historyPage.content.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50/30">
                        <td className="p-3 font-mono text-slate-600">{h.attendanceDate}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            h.status === "PRESENT" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}>
                            {h.status === "PRESENT" ? "Có mặt" : "Vắng học"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 italic text-xs">{h.note || "Không có ghi chú"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PHÂN TRANG LOGIC CHUẨN BACKEND */}
              {historyPage.totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 pt-2">
                  <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    Trước
                  </button>
                  <span className="text-xs font-medium text-slate-500">
                    Trang {currentPage + 1} / {historyPage.totalPages}
                  </span>
                  <button
                    disabled={currentPage >= historyPage.totalPages - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 transition"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">Vui lòng chỉ định một học sinh để hiển thị chuyên sâu.</div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;