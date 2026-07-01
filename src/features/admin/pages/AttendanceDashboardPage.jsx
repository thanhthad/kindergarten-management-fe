import React, { useEffect, useState } from "react";
import { attendanceApi } from "../../../api/attendanceApi"; // Thay đổi đường dẫn import nếu cần
import { 
  Calendar, Users, CheckCircle, XCircle, AlertTriangle, 
  TrendingUp, BarChart3, PieChart, ChevronLeft, ChevronRight, Loader2, Info
} from "lucide-react";

const AttendanceDashboardPage = () => {
  // --- STATES ---
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  
  // Dữ liệu API
  const [summary, setSummary] = useState([]); // [ { status: "PRESENT", total: X }, ... ]
  const [rates, setRates] = useState([]);     // Thống kê theo lớp
  const [topAbsent, setTopAbsent] = useState([]); // Top học sinh nghỉ nhiều
  const [notYetPage, setNotYetPage] = useState({  // Phân trang danh sách chưa điểm danh
    content: [],
    pageNumber: 0,
    totalPages: 1,
    totalElements: 0
  });

  // Trạng thái Loading
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // --- 1. TẢI DANH SÁCH NGÀY ĐIỂM DANH (CHỈ CHẠY 1 LẦN KHI INIT) ---
  useEffect(() => {
    setLoadingDates(true);
    attendanceApi.getAllDates()
      .then((res) => {
        if (res.data?.success) {
          const dateList = res.data.data || [];
          setDates(dateList);
          // Mặc định lấy ngày gần nhất
          if (dateList.length > 0) {
            setSelectedDate(dateList[0].attendanceDate);
          } else {
            // Nếu DB chưa có ngày nào, lấy ngày hiện tại format YYYY-MM-DD làm mặc định
            setSelectedDate(new Date().toISOString().split('T')[0]);
          }
        }
      })
      .catch((err) => console.error("Lỗi lấy danh sách ngày:", err))
      .finally(() => setLoadingDates(false));
  }, []);

  // --- 2. TẢI DỮ LIỆU ĐỒNG BỘ THEO NGÀY ĐÃ CHỌN HOẶC THAY ĐỔI TRANG ---
  useEffect(() => {
    if (selectedDate) {
      fetchDashboardData(selectedDate, notYetPage.pageNumber);
    }
  }, [selectedDate, notYetPage.pageNumber]);

  const fetchDashboardData = async (date, pageNum) => {
    setLoadingDashboard(true);
    try {
      // Chạy song song các API để tối ưu tốc độ phản hồi UI
      const [summaryRes, rateRes, topAbsentRes, notYetRes] = await Promise.all([
        attendanceApi.getSummaryByDate(date),
        attendanceApi.getRate(date),
        attendanceApi.getTopAbsent(), 
        attendanceApi.getStudentsNotYet(date, { page: pageNum, size: 5 })
      ]);

      if (summaryRes.data?.success) setSummary(summaryRes.data.data || []);
      if (rateRes.data?.success) setRates(rateRes.data.data || []);
      if (topAbsentRes.data?.success) setTopAbsent(topAbsentRes.data.data || []);
      if (notYetRes.data?.success) {
        const pageData = notYetRes.data.data;
        setNotYetPage({
          content: pageData?.content || [],
          pageNumber: pageData?.number || 0,
          totalPages: pageData?.totalPages || 1,
          totalElements: pageData?.totalElements || 0
        });
      }
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu Dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // --- 3. TÍNH TOÁN SỐ LIỆU ĐỂ HIỂN THỊ TRÊN BIỂU ĐỒ ---
  const presentItem = summary.find(i => i.status?.toUpperCase() === "PRESENT");
  const absentItem = summary.find(i => i.status?.toUpperCase() === "ABSENT");

  // ĐÃ SỬA: Đổi từ i.count sang i.total tương ứng với JSON Backend trả về
  const presentCount = presentItem ? Number(presentItem.total) : 0;
  const absentCount = absentItem ? Number(absentItem.total) : 0;
  const totalCount = presentCount + absentCount;

  // Tính toán thông số Vẽ hình tròn SVG Pie Chart an toàn, tránh NaN tuyệt đối
  const presentRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
  const absentRate = totalCount > 0 ? (absentCount / totalCount) * 100 : 0;
  
  // Nếu totalCount = 0 thì offset sẽ là toàn bộ chu vi (314) để hiển thị vòng trống
  const strokeDashoffsetPresent = totalCount > 0 ? 314 - (314 * presentRate) / 100 : 314;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 text-sm md:text-base">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= THANH ĐIỀU KHIỂN & TIÊU ĐỀ ================= */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Attendance Dashboard</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Hệ thống tổng quan giám sát chuyên cần chuyên sâu</p>
            </div>
          </div>

          {/* Chọn ngày xem dữ liệu */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setNotYetPage(prev => ({ ...prev, pageNumber: 0 })); // Reset về trang 1 khi đổi ngày
                }}
                disabled={loadingDates}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl outline-none focus:border-blue-500 focus:bg-white transition text-sm appearance-none"
              >
                {loadingDates ? (
                  <option>Đang tải ngày...</option>
                ) : dates.length === 0 ? (
                  <option value={selectedDate}>{selectedDate}</option>
                ) : (
                  dates.map((d, index) => (
                    <option key={index} value={d.attendanceDate}>
                      {d.attendanceDate.split("-").reverse().join("/")}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* LOADING OVERLAY TOÀN MÀN HÌNH NHẸ KHI ĐỔI NGÀY */}
        {loadingDashboard && (
          <div className="flex items-center justify-center py-12 gap-2 text-slate-500 font-bold bg-white rounded-3xl border border-slate-200/60 shadow-sm">
            <Loader2 className="animate-spin text-blue-600" size={20} />
            <span>Đang nạp dữ liệu ngày {selectedDate.split("-").reverse().join("/")}...</span>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${loadingDashboard ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          
          {/* ================= KHỐI TRÁI: TỔNG QUAN SỐ LIỆU & BIỂU ĐỒ TRÒN ================= */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* THẺ SỐ LIỆU PRESENT / ABSENT */}
            <div className="grid grid-cols-2 gap-4">
              {/* Thẻ có mặt */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Present</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{presentCount}</div>
                  <span className="text-xs font-semibold text-slate-400 font-mono">{presentRate.toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle size={20} />
                </div>
              </div>

              {/* Thẻ vắng mặt */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">Absent</span>
                  <div className="text-2xl font-black text-rose-500 mt-1">{absentCount}</div>
                  <span className="text-xs font-semibold text-slate-400 font-mono">{absentRate.toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
                  <XCircle size={20} />
                </div>
              </div>
            </div>

            {/* KHỐI BIỂU ĐỒ PIE CHART (DÙNG SVG KHÔNG THƯ VIỆN) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center">
              <div className="w-full flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-5">
                <PieChart size={16} className="text-slate-400" />
                <h3 className="font-bold text-slate-900 text-sm">Tỷ lệ chuyên cần tổng quan</h3>
              </div>

              {totalCount === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center">
                  <Info size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-bold">Không có dữ liệu điểm danh</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full py-2">
                  {/* Vòng tròn SVG */}
                  <div className="relative w-32 h-32 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      {/* Vòng nền đại diện cho Absent (Đỏ) */}
                      <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f43f5e" strokeWidth="14" />
                      {/* Vòng đè đại diện cho Present (Xanh) */}
                      <circle 
                        cx="60" cy="60" r="50" fill="transparent" stroke="#10b981" strokeWidth="14" 
                        strokeDasharray="314"
                        strokeDashoffset={strokeDashoffsetPresent}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[9px]">Tổng số</span>
                      <span className="text-xl font-black text-slate-800">{totalCount}</span>
                    </div>
                  </div>

                  {/* Chú thích dữ liệu biểu đồ */}
                  <div className="space-y-2.5 flex-1 w-full">
                    <div className="flex items-center justify-between text-xs border-b border-slate-50 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-600">Đã đến lớp</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{presentRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="font-bold text-slate-600">Nghỉ học</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{absentRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TOP HỌC SINH NGHỈ NHIỀU NHẤT */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Top học sinh nghỉ học nhiều</h3>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-100">
                  Tích lũy hệ thống
                </span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {topAbsent.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Không có dữ liệu vi phạm</p>
                ) : (
                  topAbsent.map((st, idx) => (
                    <div key={st.studentId || idx} className="flex items-center justify-between p-3 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{st.studentName}</p>
                          <p className="text-[10px] font-mono text-slate-400">ID: #{st.studentId}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg shrink-0">
                        {st.absentDays} ngày nghỉ
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* ================= KHỐI PHẢI: ATTENDANCE RATE THEO LỚP & CHƯA ĐIỂM DANH ================= */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TỶ LỆ ĐIỂM DANH THEO TỪNG LỚP */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-blue-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Attendance Rate theo lớp</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Chi tiết ngày hiện tại</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                {rates.length === 0 ? (
                  <div className="sm:col-span-2 text-xs text-slate-400 text-center py-10">Không tìm thấy dữ liệu lớp học</div>
                ) : (
                  rates.map((cls, index) => {
                    const currentRate = cls.rate || 0;
                    return (
                      <div key={cls.classId || index} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-slate-800 text-xs tracking-tight">{cls.className}</span>
                          <span className="font-mono text-xs font-black text-blue-600">{currentRate.toFixed(1)}%</span>
                        </div>
                        {/* Thanh Tiến Trình Giám Sát (Progress Bar) */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              currentRate >= 90 ? "bg-emerald-500" : currentRate >= 75 ? "bg-blue-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(currentRate, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mt-1.5">
                          <span>Sĩ số: {cls.total || 0}</span>
                          <span className="text-emerald-600">Có mặt: {cls.present || 0}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* DANH SÁCH CHƯA ĐIỂM DANH (CÓ PHÂN TRANG) */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 px-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-slate-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Danh sách chưa điểm danh</h3>
                </div>
                <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full">
                  Cần rà soát: {notYetPage.totalElements} học sinh
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/40">
                      <th className="py-3 px-5">Mã số</th>
                      <th className="py-3 px-5">Học sinh</th>
                      <th className="py-3 px-5">Lớp học</th>
                      <th className="py-3 px-5">Liên hệ phụ huynh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {notYetPage.content.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-10 text-center text-slate-400 font-medium">
                          Tuyệt vời! Toàn bộ học sinh đã được hoàn tất điểm danh trong ngày.
                        </td>
                      </tr>
                    ) : (
                      notYetPage.content.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-3 px-5 font-mono text-slate-400 font-semibold">#{student.id}</td>
                          <td className="py-3 px-5 font-bold text-slate-900">{student.fullName}</td>
                          <td className="py-3 px-5 font-semibold text-slate-600">{student.className || "—"}</td>
                          <td className="py-3 px-5 text-slate-500">
                            <div>{student.parentName || "—"}</div>
                            <div className="font-mono text-[11px] text-slate-400 mt-0.5">{student.parentPhone || "—"}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* THANH ĐIỀU HƯỚNG PHÂN TRANG (PAGINATION) */}
              {notYetPage.totalPages > 1 && (
                <div className="p-3 px-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Trang <strong className="text-slate-800">{notYetPage.pageNumber + 1}</strong> / {notYetPage.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={notYetPage.pageNumber === 0}
                      onClick={() => setNotYetPage(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={notYetPage.pageNumber >= notYetPage.totalPages - 1}
                      onClick={() => setNotYetPage(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendanceDashboardPage;