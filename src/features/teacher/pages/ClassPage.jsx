import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  School, 
  CalendarDays, 
  Users, 
  UserPlus, 
  FileText, 
  Loader2, 
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { classApi } from "../../../api/classApi";

const ClassPage = () => {
  const teacherId = localStorage.getItem("userId") || 1;
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classApi.getByTeacher(teacherId)
      .then(res => {
        setClassroom(res.data.data);
      })
      .catch(err => {
        console.error(err);
        toast.error("Không thể tải thông tin cấu trúc lớp học.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teacherId]);

  // Giao diện Loading Skeleton chuẩn SaaS doanh nghiệp
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
        <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-200/70 shadow-xs space-y-6">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded-md w-1/4" />
              <div className="h-3 bg-slate-200 rounded-md w-1/3" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl space-y-2 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Trường hợp không tìm thấy lớp học
  if (!classroom) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-3">
        <div className="inline-flex p-4 bg-amber-50 text-amber-600 rounded-3xl">
          <School className="w-8 h-8 stroke-[1.8]" />
        </div>
        <p className="text-sm font-bold text-slate-500">Bạn chưa được phân công quản lý lớp học nào.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="max-w-4xl mx-auto px-4 antialiased space-y-6 py-4"
    >
      {/* KHỐI BANNER CHÍNH & THÔNG TIN TÊN LỚP */}
      <div className="bg-white rounded-[32px] border border-slate-200/70 shadow-xs p-6 md:p-8 relative overflow-hidden">
        {/* Background Decor mờ ảo phía sau */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Icon lớp học nổi bật */}
          <div className="p-4 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-3xl shadow-xl shadow-indigo-600/15 relative group">
            <School className="w-7 h-7 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 bg-violet-400 text-white p-0.5 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 fill-white" />
            </span>
          </div>

          {/* Chi tiết tiêu đề lớp học */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Hồ sơ quản lý
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {classroom.name}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Không gian học tập và phát triển toàn diện của các bé.
            </p>
          </div>
        </div>
      </div>

      {/* KHỐI THÔNG SỐ CHI TIẾT DẠNG GRID CARD */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/70 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Độ tuổi quy định */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-white rounded-xl text-slate-500 border border-slate-200/60 shadow-2xs">
              <CalendarDays className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Độ tuổi quy định</span>
              <span className="text-sm font-black text-slate-800 mt-0.5 block">{classroom.age} tuổi</span>
            </div>
          </div>

          {/* Card 2: Giới hạn sĩ số */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors">
            <div className="p-3 bg-white rounded-xl text-slate-500 border border-slate-200/60 shadow-2xs">
              <UserPlus className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sĩ số tối đa</span>
              <span className="text-sm font-black text-slate-800 mt-0.5 block">{classroom.capacity} học viên</span>
            </div>
          </div>

          {/* Card 3: Sĩ số thực tế */}
          <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/40 flex items-center gap-4 hover:bg-indigo-50/50 transition-colors sm:col-span-2">
            <div className="p-3 bg-white rounded-xl text-indigo-600 border border-indigo-100 shadow-2xs">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Sĩ số thực tế hiện tại</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-indigo-600">{classroom.currentStudents}</span>
                <span className="text-xs font-bold text-slate-400">/ {classroom.capacity} bé đăng ký</span>
              </div>
            </div>
          </div>

        </div>

        {/* Khối mô tả chi tiết */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 pl-1 text-slate-400">
            <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
            <label className="block text-[10px] font-bold uppercase tracking-widest">Mô tả chi tiết lớp học</label>
          </div>
          <div className="p-4 bg-slate-50/60 border border-slate-200/50 rounded-2xl text-xs text-slate-600 font-medium leading-relaxed shadow-inner/5">
            {classroom.description ? (
              <p className="whitespace-pre-line">{classroom.description}</p>
            ) : (
              <p className="text-slate-300 italic">Hệ thống chưa ghi nhận mô tả hay ghi chú đặc biệt cho phòng học này.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassPage;