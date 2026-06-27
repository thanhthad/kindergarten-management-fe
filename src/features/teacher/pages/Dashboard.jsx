import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Loader2, 
  Sparkles,
  TrendingUp,
  ArrowRight,
  School
} from "lucide-react";
import { userApi } from "../../../api/userApi";
import { classApi } from "../../../api/classApi";
import { attendanceApi } from "../../../api/attendanceApi";

// Cấu hình Animation mượt mà chuẩn Apple Style
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", bounce: 0.2, duration: 0.6 } 
  }
};

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
      
      if (summaryRes.data.data && summaryRes.data.data.length > 0) {
        setSummaryToday(summaryRes.data.data[0]);
      }
      
      toast.success("Đồng bộ dữ liệu hôm nay thành công!", {
        icon: "✨",
        style: { 
          borderRadius: "16px", 
          background: "#0f172a", 
          color: "#fff",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }
      });
    })
    .catch(err => {
      console.error("Lỗi tải thông tin Dashboard", err);
      toast.error("Không thể tải dữ liệu mới nhất. Vui lòng thử lại!", {
        style: { borderRadius: "16px", background: "#ef4444", color: "#fff" }
      });
    })
    .finally(() => setLoading(false));
  }, []);

  // Tính toán tỷ lệ đi học trước để render dữ liệu
  const total = summaryToday?.totalAttendance || 0;
  const present = summaryToday?.present || 0;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  // --- MÀN HÌNH LOADING PREMIUM SKELETON (Tối ưu iPhone cực mượt) ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50 p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto space-y-6">
          {/* Skeleton Header */}
          <div className="h-40 w-full bg-slate-200/80 rounded-3xl animate-pulse flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="text-indigo-600 bg-white p-3 rounded-full shadow-md"
            >
              <Loader2 size={28} />
            </motion.div>
          </div>
          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
              <div className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
              <div className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 min-h-screen max-w-7xl mx-auto space-y-6 antialiased selection:bg-indigo-500 selection:text-white">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* --- KHUNG CHÀO MỪNG (HERO SECTION) --- */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-100/50 border border-indigo-500/10"
        >
          {/* Background Decor Cao Cấp */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 bottom-0 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-amber-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }} 
                    transition={{ repeat: Infinity, duration: 2.5 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  </motion.span>
                  Học đường thông minh
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Xin chào, thầy/cô <span className="text-amber-300 drop-shadow-sm">{user?.fullName || "Giáo Viên"}</span>!
              </h2>
              <p className="text-indigo-100/90 text-sm max-w-xl font-medium leading-relaxed">
                Chúc thầy cô một ngày làm việc tràn đầy năng lượng. Dưới đây là bức tranh tổng quan của lớp học hôm nay.
              </p>
            </div>
            
            {/* Lịch hiển thị thông minh trên iPhone */}
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl self-start md:self-auto border border-white/15 shadow-inner">
              <div className="p-2 bg-white/10 rounded-xl">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase text-indigo-200 font-extrabold tracking-widest">Hôm nay</p>
                <p className="text-xs sm:text-sm font-bold tracking-wide">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- GRID THÔNG TIN CHI TIẾT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARD: THÔNG TIN LỚP CHỦ NHIỆM */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-6 relative overflow-hidden group transition-all"
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-500" /> Lớp Phụ Trách
                </h3>
                <span className="text-[11px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold tracking-wide shadow-sm border border-indigo-100/50">
                  Chủ nhiệm
                </span>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 transition-colors group-hover:bg-indigo-50/30">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <School className="w-3 h-3 text-slate-400" /> Tên lớp học
                </span>
                <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">
                  {myClass?.name || "Chưa phân lớp"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100/60 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Sĩ số hiện tại</span>
                  <p className="text-xl font-black text-emerald-700 mt-1">{myClass?.currentStudents || 0} <span className="text-xs font-medium">HS</span></p>
                </div>
                <div className="p-3.5 bg-sky-50/40 rounded-2xl border border-sky-100/60 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide">Sức chứa tối đa</span>
                  <p className="text-xl font-black text-sky-700 mt-1">{myClass?.capacity || 0} <span className="text-xs font-medium">HS</span></p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Mô tả lớp học
              </span>
              <p className="text-xs text-slate-500 font-medium italic line-clamp-2 leading-relaxed">
                {myClass?.description || "Không có mô tả chi tiết cho lớp học này."}
              </p>
            </div>
          </motion.div>

          {/* CARD: THỐNG KÊ KPI ĐIỂM DANH */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* KPI: TỔNG SỐ */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng Điểm Danh</span>
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 border border-slate-100 group-hover:bg-slate-100 transition-colors">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-black text-slate-800 tracking-tight">
                  {summaryToday?.totalAttendance || 0}
                </p>
                <p className="text-xs font-bold text-slate-400 mt-1.5 flex items-center gap-1">
                  Học sinh được rà soát <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </p>
              </div>
            </motion.div>

            {/* KPI: CÓ MẶT */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Học Sinh Có Mặt</span>
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500 border border-emerald-100/50 group-hover:bg-emerald-100 transition-colors">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-black text-emerald-600 tracking-tight">
                  {summaryToday?.present || 0}
                </p>
                <p className="text-xs font-bold text-emerald-500/80 mt-1.5 flex items-center gap-1">
                  Đang ở trên lớp <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </p>
              </div>
            </motion.div>

            {/* KPI: VẮNG MẶT */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Học Sinh Vắng</span>
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-500 border border-rose-100/50 group-hover:bg-rose-100 transition-colors">
                  <UserX className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-black text-rose-500 tracking-tight">
                  {summaryToday?.absent || 0}
                </p>
                <p className="text-xs font-bold text-rose-400 mt-1.5 flex items-center gap-1">
                  Cần liên hệ phụ huynh <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* --- THANH TỶ LỆ CHUYÊN CẦN PREMIUM --- */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4"
        >
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-slate-700 text-xs sm:text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Tỷ lệ chuyên cần trong ngày
            </span>
            <span className="font-black text-sm sm:text-base text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100/30">
              {attendanceRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-[2px] border border-slate-200/40">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${attendanceRate}%` }}
              transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }} // Hiệu ứng spring Elastic nhẹ khi chạy
              className="bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600 h-full rounded-full shadow-inner"
            />
          </div>
        </motion.div>
        
      </motion.div>
    </div>
  );
};

export default Dashboard;