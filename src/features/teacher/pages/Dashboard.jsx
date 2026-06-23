import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  Activity, 
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { classApi } from "../../../api/classApi";

const Dashboard = () => {
  const teacherId = Number(localStorage.getItem("userId")) || 1; 
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Tạo lời chào thông minh theo thời gian thực tế trong ngày
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  useEffect(() => {
    if (!teacherId) {
      console.error("Không tìm thấy ID giáo viên trong hệ thống.");
      setError(true);
      setLoading(false);
      return;
    }

    classApi.getByTeacher(teacherId)
      .then(res => {
        setClassroom(res.data.data); 
      })
      .catch(err => {
        console.error("Lỗi khi tải dữ liệu từ API:", err);
        setError(true);
        toast.error("Không thể kết nối để lấy dữ liệu tổng quan.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teacherId]);

  // Tính toán tỷ lệ phần trăm sĩ số lớp học để vẽ thanh Progress Bar
  const studentPercentage = classroom 
    ? Math.min((classroom.currentStudents / classroom.capacity) * 100, 100) 
    : 0;

  // Giao diện Lỗi Hệ thống chuẩn UI doanh nghiệp
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-rose-50 border border-rose-200/60 p-6 rounded-[24px] flex items-start gap-4 text-rose-700">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 stroke-[2.2]" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-rose-900">Mất kết nối dữ liệu tổng quan</h3>
            <p className="text-xs font-medium opacity-90">Không thể tải thông tin lớp học. Vui lòng kiểm tra lại phiên đăng nhập của bạn hoặc thử lại sau.</p>
          </div>
        </div>
      </div>
    );
  }

  // Giao diện Loading Skeleton mượt mà
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
        <div className="space-y-2 animate-pulse">
          <div className="h-7 bg-slate-200 rounded-lg w-1/4" />
          <div className="h-4 bg-slate-200 rounded-lg w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white border border-slate-200/60 rounded-[28px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="max-w-6xl mx-auto px-4 antialiased space-y-8 py-4"
    >
      
      {/* 1. KHỐI TIÊU ĐỀ CHÀO MỪNG (WELCOME BANNER) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/70 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit">
            <LayoutDashboard className="w-3 h-3" />
            Bảng điều khiển trung tâm
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            {getTimeBasedGreeting()}, Giáo viên! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Dưới đây là thông số vận hành và tình trạng thực tế lớp học của ông hôm nay.
          </p>
        </div>
      </div>

      {/* 2. HỆ THỐNG STAT CARDS 3 CỘT CAO CẤP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: LỚP PHỤ TRÁCH */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-200/70 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lớp phụ trách</span>
              <span className="text-xl font-black text-slate-800 tracking-tight block pt-1">
                {classroom?.name || "Chưa phân công"}
              </span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Thông tin hồ sơ</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* CARD 2: SĨ SỐ LỚP HỌC & PROGRESS BAR */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-200/70 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tỉ lệ sĩ số</span>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-2xl font-black text-indigo-600 tracking-tight">
                  {classroom?.currentStudents || 0}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {classroom?.capacity || 0} bé</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          
          {/* Thanh tiến độ lấp đầy học viên cực chuyên nghiệp */}
          <div className="mt-4 space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${studentPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-indigo-600 h-full rounded-full"
              />
            </div>
            <div className="flex justify-end text-[9px] font-bold text-indigo-500 uppercase tracking-wider">
              Đạt {Math.round(studentPercentage)}% mục tiêu
            </div>
          </div>
        </div>

        {/* CARD 3: TRẠNG THÁI HOẠT ĐỘNG */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-200/70 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Trạng thái vận hành</span>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100/50">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {classroom?.status || "Đang hoạt động"}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Thời gian thực tế</span>
            <span className="text-[10px] font-medium text-slate-400">Ổn định</span>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default Dashboard;