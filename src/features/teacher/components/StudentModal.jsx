import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  User, 
  Calendar, 
  HeartHandshake, 
  Phone, 
  Activity, 
  Loader2, 
  Save,
  GraduationCap,
  Mail,
  MapPin,
  Smile
} from "lucide-react";
import { studentApi } from "../../../api/studentApi";

const StudentModal = ({ classId, studentId, onClose, onSaveSuccess }) => {
  const isEditMode = !!studentId;

  // Khởi tạo đầy đủ form dữ liệu đồng bộ chính xác với DTO Backend
  const [form, setForm] = useState({
    fullName: "",
    gender: "Male",        // Đồng bộ mặc định chuỗi giống Backend
    dateOfBirth: "",       // Định dạng YYYY-MM-DD
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    status: "Active"       // Giữ mặc định trạng thái DB dạng chuỗi chữ hoa đầu
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Lấy chi tiết thông tin nếu ở chế độ SỬA
  useEffect(() => {
    if (isEditMode) {
      const fetchStudentDetail = async () => {
        setLoadingData(true);
        try {
          const res = await studentApi.getByClass(classId); 
          const currentList = res.data.data || res.data;
          const found = currentList.find(item => item.id === studentId);
          
          if (found) {
            setForm({
              fullName: found.fullName || "",
              gender: found.gender || "Male",
              dateOfBirth: found.dateOfBirth || "",
              parentName: found.parentName || "",
              parentPhone: found.parentPhone || "",
              parentEmail: found.parentEmail || "",
              address: found.address || "",
              status: found.status || "Active"
            });
          }
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết học sinh:", error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchStudentDetail();
    }
  }, [studentId, classId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      const payload = { ...form, classId };
      
      if (isEditMode) {
        await studentApi.update?.(studentId, payload) || 
        await studentApi.save?.({ id: studentId, ...payload });
      } else {
        await studentApi.create?.(payload) || 
        await studentApi.save?.(payload);
      }
      onSaveSuccess(); 
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu học sinh:", error);
      alert(error.response?.data?.message || "Thao tác thất bại, vui lòng kiểm tra lại.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      {/* NỀN BACKDROP MỜ SANG TRỌNG */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* WINDOW MODAL CHÍNH (Tăng max-w-xl để giao diện thoáng, đủ chỗ chia cột) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white w-full max-w-xl rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative z-10"
      >
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isEditMode ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                {isEditMode ? "Cập nhật hồ sơ bé" : "Thêm học sinh lớp mới"}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Đồng bộ chuẩn xác thông tin với hệ thống dữ liệu.</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* LOADING STATE */}
        {loadingData ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-semibold">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Đang tải thông tin học sinh...</span>
          </div>
        ) : (
          
          /* FORM BODY NHẬP LIỆU */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Hàng 1: Họ tên + Giới tính */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ và Tên bé</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nhập tên đầy đủ học sinh"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giới tính</label>
                <div className="relative group">
                  <Smile className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                  <select 
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hàng 2: Ngày sinh + Trạng thái */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ngày tháng năm sinh</label>
                <div className="relative group">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="date" 
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trạng thái học tập</label>
                <div className="relative group">
                  <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                  <select 
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Active">Đang học (Active)</option>
                    <option value="Inactive">Nghỉ học (Inactive)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hàng 3: Người bảo hộ + Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phụ huynh đại diện</label>
                <div className="relative group">
                  <HeartHandshake className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    required
                    placeholder="Họ tên cha hoặc mẹ"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Số điện thoại liên hệ</label>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    name="parentPhone"
                    value={form.parentPhone}
                    onChange={handleChange}
                    required
                    placeholder="VD: 0912345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Hàng 4: Email liên hệ phụ huynh (Bổ sung mới) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ phụ huynh</label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="email" 
                  name="parentEmail"
                  value={form.parentEmail}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email (Không bắt buộc)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            {/* Hàng 5: Địa chỉ của bé (Bổ sung mới) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ thường trú</label>
              <div className="relative group">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Thành phố..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              </div>
            </div>

            {/* CHÂN BUTTONS HÀNH ĐỘNG */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              
              <button
                type="submit"
                disabled={loadingSubmit}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-md cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed ${
                  isEditMode ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/10" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/10"
                }`}
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEditMode ? "Cập nhật" : "Lưu học sinh"}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </motion.div>
    </div>
  );
};

export default StudentModal;