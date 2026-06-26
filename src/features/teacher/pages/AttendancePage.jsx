import React, { useEffect, useState } from "react";
import { attendanceApi } from "../../../api/attendanceApi";
import toast from "react-hot-toast";

const AttendancePage = () => {
  const getTodayLocalStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayLocalStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [availableDates, setAvailableDates] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Lấy lịch sử các ngày đã điểm danh từ phân trang Backend (successPaginate trả về mảng trực tiếp tại .data)
  useEffect(() => {
    attendanceApi.getDatesByClass({ page: 0, size: 100 })
      .then((res) => {
        const responseBody = res.data; 
        if (responseBody && responseBody.success) {
          // ResponseData.successPaginate gán thẳng page.getContent() vào trường data
          setAvailableDates(Array.isArray(responseBody.data) ? responseBody.data : []);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách ngày:", err);
        setAvailableDates([]);
      });
  }, []);

  // 2. Kích hoạt tải dữ liệu học sinh theo ngày chọn lọc thông minh
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      if (selectedDate === todayStr) {
        // SỬA LỖI: Thêm await và loại bỏ dấu phủ định chuyên môn
        const res = await attendanceApi.init();
        setAttendanceList(res.data?.data || []);
      } else {
        // Gọi API lấy dữ liệu ngày cũ
        const res = await attendanceApi.getClassAttendance(selectedDate);
        setAttendanceList(res.data?.data || []);
      }
    } catch (err) {
      console.error("Lỗi fetch điểm danh:", err);
      setAttendanceList([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Cập nhật trực tiếp trạng thái chuyên cần inline
  const handleInlineUpdate = async (id, updatedFields) => {
    // Tìm kiếm bản ghi cục bộ thông qua id duy nhất
    const item = attendanceList.find(a => a.id === id || a.studentId === id);
    if (!item) return;

    const targetId = item.id || item.studentId; // Phòng ngừa mapping id từ ClassAttendanceResponse ngày cũ

    const requestData = {
      status: updatedFields.status !== undefined ? updatedFields.status : item.status,
      note: updatedFields.note !== undefined ? updatedFields.note : item.note
    };

    try {
      await attendanceApi.update(targetId, requestData);
      
      // Đồng bộ UI ngay lập tức đem lại trải nghiệm mượt mà
      setAttendanceList(prev => 
        prev.map(a => (a.id === targetId || a.studentId === targetId) ? { ...a, ...requestData } : a)
      );
      toast.success("Hệ thống đã cập nhật thông tin chuyên cần!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-6xl mx-auto">
        
        {/* Bộ Lọc Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Sổ Điểm Danh Điện Tử</h2>
            <p className="text-sm text-slate-500">Khởi tạo điểm danh ngày mới hoặc tra cứu dữ liệu lịch sử lớp học</p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Chọn Ngày:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-200 p-2 px-3 rounded-lg text-sm bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition cursor-pointer"
            >
              <option value={todayStr}>Hôm nay ({todayStr})</option>
              {availableDates
                .filter(d => d?.attendanceDate !== todayStr)
                .map((d, index) => (
                  <option key={index} value={d.attendanceDate}>
                    {d.attendanceDate}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Bảng Dữ Liệu Chuyên Cần */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Đang tải cấu trúc lớp học...</div>
        ) : attendanceList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            Không tìm thấy dữ liệu điểm danh cho ngày được chọn.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 w-32">Mã Học Sinh</th>
                  <th className="p-4">Tên Học Sinh</th>
                  <th className="p-4 text-center w-48">Trạng Thái</th>
                  <th className="p-4">Ghi Chú Chuyên Cần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {attendanceList.map((item) => {
                  const keyId = item.id || item.studentId;
                  return (
                    <tr key={keyId} className="hover:bg-slate-50/40 transition">
                      <td className="p-4 font-mono font-bold text-slate-400">#{item.studentId}</td>
                      <td className="p-4 font-semibold text-slate-800">{item.studentName}</td>
                      <td className="p-4 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100/80 border border-slate-200/60 shadow-sm">
                          <button
                            onClick={() => handleInlineUpdate(keyId, { status: "PRESENT" })}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              item.status === "PRESENT" 
                                ? "bg-white text-emerald-600 shadow-md ring-1 ring-black/5" 
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Có Mặt
                          </button>
                          <button
                            onClick={() => handleInlineUpdate(keyId, { status: "ABSENT" })}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              item.status === "ABSENT" 
                                ? "bg-white text-rose-600 shadow-md ring-1 ring-black/5" 
                                : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            Vắng
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          defaultValue={item.note || ""}
                          placeholder="Nhập lý do nghỉ, đi muộn..."
                          onBlur={(e) => handleInlineUpdate(keyId, { note: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.target.blur();
                          }}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none py-1 transition text-sm text-slate-600 placeholder:text-slate-300 font-medium"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;