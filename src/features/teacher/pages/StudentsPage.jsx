import React, { useEffect, useState } from "react";
import { studentApi } from "../../../api/studentApi";
import { attendanceApi } from "../../../api/attendanceApi";
import toast from "react-hot-toast";
import { 
  Users, User, Calendar, MapPin, Phone, Mail, 
  CheckCircle2, XCircle, AlertTriangle, Loader2, Info, ArrowLeft
} from "lucide-react";

// Từ điển việt hóa dữ liệu DB (Hỗ trợ cả chữ thường và chữ hoa từ API)
const TRANSLATIONS = {
  male: "Nam",
  female: "Nữ",
  present: "Có mặt",
  absent: "Vắng mặt"
};

const translate = (key) => {
  if (!key) return "—";
  return TRANSLATIONS[key.toLowerCase()] || key;
};

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [profile, setProfile] = useState(null);
  const [statistic, setStatistic] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetailMobile, setShowDetailMobile] = useState(false);

  // ================= LOAD STUDENTS =================
  useEffect(() => {
    setLoadingList(true);
    studentApi
      .getMyClass()
      .then((res) => {
        if (res.data?.success) {
          const list = res.data.data || [];
          setStudents(list);

          if (list.length > 0) {
            setSelectedStudentId(list[0].id);
          }
        }
      })
      .catch(() => toast.error("Không thể tải danh sách lớp"))
      .finally(() => setLoadingList(false));
  }, []);

  // ================= LOAD STUDENT DETAIL =================
  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentData(selectedStudentId);
    }
  }, [selectedStudentId]);

  const fetchStudentData = async (studentId) => {
    setLoadingDetail(true);
    try {
      const [profileRes, statRes, historyRes] = await Promise.all([
        studentApi.getById(studentId),
        attendanceApi.getStudentStatistic(studentId),
        attendanceApi.getStudentHistory(studentId),
      ]);

      if (profileRes.data?.success) setProfile(profileRes.data.data);
      if (statRes.data?.success) setStatistic(statRes.data.data);
      if (historyRes.data?.success) setHistoryList(historyRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải dữ liệu học sinh");
    } finally {
      setLoadingDetail(false);
    }
  };

  // ================= HANDLE UPDATE STUDENT INFO (Xử lý logic loại bỏ status và map gender) =================
  const handleUpdateStudent = async (updatedData) => {
    try {
      // 1. Loại bỏ trường 'status' để không gửi lên DB theo yêu cầu của bạn
      const { status, ...cleanData } = updatedData;

      // 2. Chuyển đổi ngược từ Tiếng Việt (Nam/Nữ) thành Tiếng Anh (male/female) trước khi lưu vào DB
      if (cleanData.gender === "Nam") cleanData.gender = "male";
      if (cleanData.gender === "Nữ") cleanData.gender = "female";

      const res = await studentApi.update(selectedStudentId, cleanData);
      if (res.data?.success) {
        toast.success("Cập nhật thông tin học sinh thành công");
        fetchStudentData(selectedStudentId); // Tải lại dữ liệu mới nhất
      }
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    setShowDetailMobile(true);
  };

  // ================= STATS =================
  const totalDays = (statistic?.presentDays || 0) + (statistic?.absentDays || 0);
  const absentRate = totalDays > 0 ? ((statistic?.absentDays / totalDays) * 100).toFixed(1) : 0;
  const isDanger = absentRate > 20;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden relative text-base">
      
      {/* ================= SIDEBAR (DANH SÁCH HỌC SINH) ================= */}
      <div className={`w-full md:w-85 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm transition-all duration-300 ${
        showDetailMobile ? "hidden md:flex" : "flex"
      }`}>
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <Users size={22} className="text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Danh sách lớp</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            {students.length} học sinh hiện tại
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingList ? (
            <div className="flex items-center justify-center p-10 gap-2.5 text-base text-slate-400">
              <Loader2 size={20} className="animate-spin" />
              <span>Đang tải danh sách...</span>
            </div>
          ) : (
            students.map((st) => {
              const isSelected = selectedStudentId === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStudent(st.id)}
                  className={`w-full text-left p-5 transition-all relative flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "hover:bg-slate-50/80 text-slate-700"
                  }`}
                >
                  <div>
                    <div className={`text-base ${isSelected ? "text-blue-800 font-bold" : "text-slate-900 font-semibold"}`}>
                      {st.fullName}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">#{st.id}</div>
                  </div>
                  {isSelected && (
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-l hidden md:block" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= DETAIL CONTENT (CHI TIẾT HỌC SINH) ================= */}
      <div className={`flex-1 overflow-y-auto bg-slate-50/50 h-full transition-all duration-300 ${
        showDetailMobile ? "flex flex-col" : "hidden md:flex md:flex-col"
      }`}>
        
        {/* Nút Quay lại trên Mobile */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center md:hidden sticky top-0 z-10 shadow-sm">
          <button 
            onClick={() => setShowDetailMobile(false)}
            className="flex items-center gap-2 text-base font-bold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} />
            <span>Quay lại danh sách</span>
          </button>
        </div>

        {loadingDetail && !profile ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 p-4">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <span className="text-base font-semibold">Đang tải hồ sơ học sinh...</span>
          </div>
        ) : profile ? (
          <div className="p-5 sm:p-8 md:p-10 max-w-5xl mx-auto space-y-8 w-full">

            {/* HEADER & STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Thẻ Có mặt */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Có mặt</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1.5">
                    {statistic?.presentDays || 0} <span className="text-sm font-normal text-slate-400">ngày</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              {/* Thẻ Vắng mặt */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vắng mặt</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-500 mt-1.5">
                    {statistic?.absentDays || 0} <span className="text-sm font-normal text-slate-400">ngày</span>
                  </div>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                  <XCircle size={24} />
                </div>
              </div>

              {/* Thẻ Tỷ lệ vắng */}
              <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${
                isDanger 
                  ? "bg-red-50/50 border-red-100 text-red-900" 
                  : "bg-white border-slate-100"
              }`}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tỷ lệ vắng</span>
                  <div className={`text-2xl sm:text-3xl font-extrabold mt-1.5 ${isDanger ? "text-red-600" : "text-slate-800"}`}>
                    {absentRate}%
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${isDanger ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                  {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
                </div>
              </div>
            </div>

            {/* PROFILE CARD */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="h-14 w-14 min-w-[56px] rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-extrabold">
                  {profile.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">{profile.fullName}</h3>
                  <p className="text-sm text-slate-500 font-semibold mt-0.5">Lớp: {profile.className || "Chưa xếp lớp"}</p>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
                <div className="flex items-center gap-3.5 text-slate-700">
                  <User size={18} className="text-slate-400" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Giới tính</span>
                    <span className="font-medium text-slate-900">{translate(profile.gender)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 text-slate-700">
                  <Calendar size={18} className="text-slate-400" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Ngày sinh</span>
                    <span className="font-medium text-slate-900">{profile.dateOfBirth || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 text-slate-700">
                  <Phone size={18} className="text-slate-400" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">SĐT Phụ huynh</span>
                    <span className="font-medium text-slate-900">{profile.parentPhone || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 text-slate-700">
                  <Mail size={18} className="text-slate-400" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Email Phụ huynh</span>
                    <span className="font-medium text-slate-900">{profile.parentEmail || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 text-slate-700 sm:col-span-2 border-t border-slate-100 pt-4">
                  <MapPin size={18} className="text-slate-400" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Địa chỉ thường trú</span>
                    <span className="font-medium text-slate-900">{profile.address || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ATTENDANCE HISTORY */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Lịch sử điểm danh</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-base text-left border-collapse min-w-[450px]">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="py-4 px-5 sm:px-6">Ngày học</th>
                      <th className="py-4 px-5 sm:px-6">Trạng thái</th>
                      <th className="py-4 px-5 sm:px-6">Ghi chú</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {historyList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-12 text-center text-slate-400 font-semibold">
                          Chưa có lịch sử điểm danh nào.
                        </td>
                      </tr>
                    ) : (
                      historyList.map((h, i) => {
                        const isPresent = h.status?.toUpperCase() === "PRESENT";
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-5 sm:px-6 font-semibold text-slate-800">{h.attendanceDate}</td>
                            <td className="py-4 px-5 sm:px-6">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                                isPresent 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${isPresent ? "bg-emerald-500" : "bg-rose-500"}`} />
                                {translate(h.status)}
                              </span>
                            </td>
                            <td className="py-4 px-5 sm:px-6 text-slate-500 italic text-sm">
                              {h.note || "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-4">
            <Users size={56} className="text-slate-300 mb-3" />
            <p className="text-base font-semibold">Vui lòng chọn một học sinh bên danh sách</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;