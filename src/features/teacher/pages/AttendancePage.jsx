import React, { useEffect, useState, useMemo, useCallback } from "react";
import { attendanceApi } from "../../../api/attendanceApi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Calendar, 
  Check, 
  X, 
  Save, 
  Loader2, 
  UserX, 
  Search, 
  ClipboardCheck, 
  FileText,
  Sparkles,
  ChevronRight,
  ArrowUpCircle
} from "lucide-react";

// Tách riêng Component ô nhập ghi chú để chống lag khi gõ (Debounce nội bộ)
const NoteInput = ({ initialValue, onSaveChange, placeholder, className }) => {
  const [val, setVal] = useState(initialValue || "");

  useEffect(() => {
    setVal(initialValue || "");
  }, [initialValue]);

  return (
    <input
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        if (val !== (initialValue || "")) {
          onSaveChange(val);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.target.blur();
        }
      }}
      className={className}
      placeholder={placeholder}
    />
  );
};

const AttendancePage = () => {
  const getTodayLocalStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayStr = getTodayLocalStr();

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [attendanceList, setAttendanceList] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNoteId, setActiveNoteId] = useState(null);

  // ================= LOAD DATES =================
  useEffect(() => {
    attendanceApi
      .getDatesByClass()
      .then((res) => {
        const data = res.data?.data;
        setAvailableDates(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setAvailableDates([]);
        toast.error("Không load được danh sách ngày");
      });
  }, []);

  // ================= LOAD ATTENDANCE BY DATE =================
  useEffect(() => {
    let isMounted = true;
    const fetchData = async (date) => {
      setLoading(true);
      try {
        const res = await attendanceApi.getClassAttendance(date);
        if (isMounted) {
          setAttendanceList(res.data?.data || []);
          setPendingUpdates([]);
        }
      } catch (err) {
        toast.error("Không thể tải dữ liệu điểm danh");
        if (isMounted) setAttendanceList([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData(selectedDate);
    return () => { isMounted = false; };
  }, [selectedDate]);

  // ================= UPDATE LOCAL (OPTIMIZED ⚡) =================
  // Dùng useCallback để tránh render lại các hàm xử lý dữ liệu liên tục
  const updateLocal = useCallback((id, fields) => {
    setAttendanceList((prev) => {
      const idx = prev.findIndex((x) => (x.id === id || x.studentId === id));
      if (idx === -1) return prev;

      const currentItem = prev[idx];
      const targetId = currentItem.id || currentItem.studentId;

      const updatedStatus = fields.status !== undefined ? fields.status : currentItem.status;
      const updatedNote = fields.note !== undefined ? fields.note : currentItem.note;

      // Cập nhật danh sách lưu tạm Batch song song một cách an toàn
      setPendingUpdates((prevPending) => {
        const pIdx = prevPending.findIndex((x) => x.attendanceId === targetId);
        const newItem = { attendanceId: targetId, status: updatedStatus, note: updatedNote };
        if (pIdx !== -1) {
          const copy = [...prevPending];
          copy[pIdx] = newItem;
          return copy;
        }
        return [...prevPending, newItem];
      });

      // Trả về mảng mới đã chỉnh sửa phần tử
      const nextList = [...prev];
      nextList[idx] = { ...currentItem, ...fields };
      return nextList;
    });
  }, []);

  // ================= SAVE BATCH =================
  const saveAll = async () => {
    if (!pendingUpdates.length) return;

    setSaving(true);
    try {
      await attendanceApi.batchUpdate(pendingUpdates);
      toast.success("Đồng bộ dữ liệu thành công!", {
        icon: "🎉",
        style: { 
          borderRadius: "16px", 
          background: "rgba(15, 23, 42, 0.95)", 
          backdropFilter: "blur(10px)",
          color: "#fff",
          fontSize: "13px"
        }
      });
      setPendingUpdates([]);
    } catch {
      toast.error("Lưu dữ liệu thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Mảng lọc mượt mà, loại bỏ tính toán dư thừa
  const filteredList = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return attendanceList;
    return attendanceList.filter((item) =>
      item.studentName?.toLowerCase().includes(lowerSearch) ||
      item.studentId?.toString().includes(lowerSearch)
    );
  }, [attendanceList, searchTerm]);

  // Điều chỉnh cấu hình Spring chuẩn iOS dịu mắt, tránh nảy quá đà gây giật khung hình
  const iosSpring = { type: "spring", stiffness: 220, damping: 26 };

  return (
    <div className="space-y-6 pb-24 md:pb-6 select-none">
      
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-4 md:p-6">
        
        {/* HEADER PANEL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="md:hidden text-[10px] font-bold tracking-widest text-indigo-600 uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-100" /> Sổ tay số
              </span>
              <div className="hidden md:flex p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h2 className="hidden md:block text-xl font-bold text-slate-800">Sổ Điểm Danh Lớp Học</h2>
            </div>
            <h1 className="md:hidden text-2xl font-black tracking-tight text-slate-900">Chuyên Cần</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Hỗ trợ ghi nhớ trạng thái lưu tạm và đồng bộ đồng loạt.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-44 md:focus:w-56 pl-9 pr-4 py-2.5 md:py-2 border border-slate-200 rounded-2xl md:rounded-xl text-xs font-semibold focus:outline-hidden focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all bg-slate-50/50"
              />
            </div>

            {/* Date Capsule Dropdown */}
            <div className="relative flex items-center bg-white border border-slate-200/80 rounded-full md:rounded-xl pl-3 pr-7 py-2.5 md:py-2 shadow-xs hover:border-indigo-500 transition-colors cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 mr-2" />
              <select
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden appearance-none cursor-pointer z-10"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value={todayStr}>Hôm nay</option>
                {availableDates.map((d, i) => {
                  const dateVal = d.attendanceDate || d;
                  if (dateVal === todayStr) return null;
                  return <option key={i} value={dateVal}>{dateVal}</option>;
                })}
              </select>
              <ChevronRight className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90" />
            </div>

            {/* Desktop Save Button */}
            <AnimatePresence>
              {pendingUpdates.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveAll}
                  disabled={saving}
                  className="hidden md:flex px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 items-center gap-2 border border-indigo-500/10"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{saving ? "Đang lưu..." : `Lưu thay đổi (${pendingUpdates.length})`}</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* LOADING & EMPTY STATES */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Đang đồng bộ danh sách lớp học...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
              <UserX className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">Không tìm thấy dữ liệu phù hợp</p>
          </div>
        ) : (
          <>
            {/* 🖥️ VIEW 1: DESKTOP TABLE Layout */}
            <div className="hidden md:block mt-4 overflow-x-auto rounded-xl border border-slate-100 bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4 w-28">Mã Học Sinh</th>
                    <th className="p-4">Họ Và Tên</th>
                    <th className="p-4 text-center w-56">Trạng Thái</th>
                    <th className="p-4">Ghi Chú Chuyên Cần</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {filteredList.map((item) => {
                    const id = item.id || item.studentId;
                    const isPresent = item.status === "PRESENT";
                    const isAbsent = item.status === "ABSENT";

                    return (
                      <tr key={id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="p-4 font-bold text-slate-400 group-hover:text-slate-600">#{item.studentId}</td>
                        <td className="p-4 font-bold text-slate-800 text-sm">{item.studentName}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateLocal(id, { status: "PRESENT" })}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                isPresent ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Đi học</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateLocal(id, { status: "ABSENT" })}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                isAbsent ? "bg-rose-500 text-white border-rose-500 shadow-sm" : "bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:bg-slate-50"
                              }`}
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Vắng</span>
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="relative flex items-center">
                            <FileText className="w-3.5 h-3.5 text-slate-300 absolute left-3" />
                            <NoteInput
                              initialValue={item.note}
                              onSaveChange={(text) => updateLocal(id, { note: text })}
                              className="w-full border border-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium focus:outline-hidden focus:border-indigo-400 focus:bg-white bg-slate-50/30 transition-all"
                              placeholder="Lý do vắng, đi muộn..."
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 📱 VIEW 2: IPHONE CARD Layout */}
            <div className="md:hidden mt-4 space-y-3">
              {filteredList.map((item) => {
                const id = item.id || item.studentId;
                const isPresent = item.status === "PRESENT";
                const isAbsent = item.status === "ABSENT";
                const hasNote = !!item.note;

                return (
                  <motion.div
                    key={id}
                    layout="position" // Chỉ áp dụng chuyển động vị trí, tránh ép trình duyệt tính toán kích thước hộp (box-sizing) liên tục
                    transition={iosSpring}
                    className={`bg-white rounded-2xl border p-4 transition-all relative overflow-hidden ${
                      isPresent ? "border-emerald-500/30 bg-emerald-50/10" : 
                      isAbsent ? "border-rose-500/30 bg-rose-50/10" : "border-slate-100"
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      isPresent ? "bg-emerald-500" : isAbsent ? "bg-rose-500" : "bg-slate-200"
                    }`} />

                    <div className="flex items-center justify-between pl-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center font-black text-[11px] ${
                          isPresent ? "bg-emerald-100 text-emerald-700" : isAbsent ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {item.studentName?.split(" ").pop()?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm tracking-tight">{item.studentName}</h3>
                          <p className="text-[10px] font-bold text-slate-400">ID: #{item.studentId}</p>
                        </div>
                      </div>

                      {/* iOS Capsule Sliding Toggle */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/30">
                        <button
                          type="button"
                          onClick={() => updateLocal(id, { status: "PRESENT" })}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            isPresent ? "bg-white text-emerald-600 shadow-xs" : "text-slate-400"
                          }`}
                        >
                          Có mặt
                        </button>
                        <button
                          type="button"
                          onClick={() => updateLocal(id, { status: "ABSENT" })}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            isAbsent ? "bg-white text-rose-600 shadow-xs" : "text-slate-400"
                          }`}
                        >
                          Vắng
                        </button>
                      </div>
                    </div>

                    {/* Mobile Dynamic Note Area */}
                    <div className="mt-3 pl-1 pt-2 border-t border-slate-100/70 flex items-center justify-between">
                      {activeNoteId === id ? (
                        <div className="relative w-full flex items-center">
                          <FileText className="w-3.5 h-3.5 text-indigo-500 absolute left-2" />
                          <NoteInput
                            initialValue={item.note}
                            placeholder="Ghi chú nhanh lý do..."
                            className="w-full bg-slate-50 border border-indigo-200 text-[11px] font-semibold pl-7 pr-12 py-1.5 rounded-lg text-slate-800 focus:outline-hidden"
                            onSaveChange={(text) => updateLocal(id, { note: text })}
                          />
                          <button 
                            type="button" 
                            onMouseDown={(e) => {
                              // Ngăn chặn onBlur của ô input kích hoạt trước khi nhấn được nút
                              e.preventDefault(); 
                              setActiveNoteId(null);
                            }} 
                            className="absolute right-2 text-indigo-600 text-[10px] font-bold px-1.5 py-1"
                          >
                            Xong
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveNoteId(id)}
                          className={`text-[11px] font-semibold flex items-center gap-1.5 ${hasNote ? "text-indigo-600 font-bold" : "text-slate-400"}`}
                        >
                          <FileText className="w-3.5 h-3.5 opacity-60" />
                          <span className="truncate max-w-[200px] text-left">{item.note || "Thêm lý do vắng/muộn..."}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* FLOATING ACTION BOTTOM BAR FOR MOBILE */}
      <AnimatePresence>
        {pendingUpdates.length > 0 && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="md:hidden fixed bottom-6 left-4 right-4 z-40 max-w-sm mx-auto"
          >
            <button
              onClick={saveAll}
              disabled={saving}
              className="w-full py-3.5 bg-slate-900 active:scale-95 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-[0_12px_24px_rgba(15,23,42,0.3)] flex items-center justify-center gap-2 border border-slate-800"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUpCircle className="w-4 h-4 text-indigo-400" />
              )}
              <span>{saving ? "Đang đồng bộ..." : `Đồng bộ hệ thống (${pendingUpdates.length})`}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AttendancePage;