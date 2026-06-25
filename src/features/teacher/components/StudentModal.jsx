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
import toast from "react-hot-toast"; // ĐÃ IMPORT ĐỂ ĐỒNG BỘ VỚI TOASTER TOÀN APP
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
          toast.error("Không thể tải thông tin chi tiết của bé.");
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

  // Hàm click chọn nhanh giới tính/trạng thái không cần dùng select box cũ kỹ
  const handleDirectSelect = (name, value) => {
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
        toast.success(`Đã cập nhật thành công hồ sơ bé ${form.fullName}!`);
      } else {
        await studentApi.create?.(payload) || 
        await studentApi.save?.(payload);
        toast.success(`Đã thêm bé ${form.fullName} vào danh sách lớp!`);
      }
      onSaveSuccess(); 
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu học sinh:", error);
      // THAY THẾ ALERT BẰNG TOAST ĐỒNG BỘ HỆ THỐNG
      toast.error(error.response?.data?.message || "Thao tác thất bại, vui lòng kiểm tra lại.");
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
      />

      {/* WINDOW MODAL CHÍNH */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white w-full max-w-xl rounded-[32px] border border-slate-200/60 shadow-2xl overflow-hidden relative z-10"
      >
        {/* HEADER MODAL */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shadow-sm ${isEditMode ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}>
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                {isEditMode ? "Cập nhật hồ sơ bé" : "Thêm học sinh mới"}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Đồng bộ dữ liệu thời gian thực với máy chủ.</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition duration-200 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* LOADING STATE AN TOÀN */}
        {loadingData ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs font-bold">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <span className="tracking-wide">Đang đồng bộ thông tin học sinh...</span>
          </div>
        ) : (
          
          /* FORM BODY NHẬP LIỆU CHUYÊN NGHIỆP */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto antialiased">
            
            {/* Hàng 1: Họ tên + Giới tính */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Họ và Tên bé</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                  <input 
                    type="text" 
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ tên đầy đủ"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Thay đổi từ select box thành Nút chọn tương tác nhanh */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Giới tính</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/30 h-[42px]">
                  <button
                    type="button"
                    onClick={() => handleDirectSelect("gender", "Male")}
                    className={`flex-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${form.gender === "Male" ? "bg-white text-indigo-600 shadow-2xs font-black" : "text-slate-400"}`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectSelect("gender", "Female")}
                    className={`flex-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${form.gender === "Female" ? "bg-white text-rose-500 shadow-2xs font-black" : "text-slate-400"}`}
                  >
                    Nữ
                  </button>
                </div>
              </div>
            </div>

            {/* Hàng 2: Ngày sinh + Trạng thái */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ngày sinh</label>
                <div className="relative group">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                  <input 
                    type="date" 
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>

              {/* Thay đổi từ select box sang ô chọn trạng thái thiết kế SaaS */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Trạng thái học tập</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/30 h-[42px]">
                  <button
                    type="button"
                    onClick={() => handleDirectSelect("status", "Active")}
                    className={`flex-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider ${form.status === "Active" ? "bg-white text-emerald-600 shadow-2xs font-black" : "text-slate-400"}`}
                  >
                    Đang học
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectSelect("status", "Inactive")}
                    className={`flex-1 text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider ${form.status === "Inactive" ? "bg-white text-rose-600 shadow-2xs font-black" : "text-slate-400"}`}
                  >
                    Nghỉ học
                  </button>
                </div>
              </div>
            </div>

            {/* Hàng 3: Người bảo hộ + Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Phụ huynh đại diện</label>
                <div className="relative group">
                  <HeartHandshake className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                  <input 
                    type="text" 
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    required
                    placeholder="Họ tên cha hoặc mẹ"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Số điện thoại liên hệ</label>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                  <input 
                    type="text" 
                    name="parentPhone"
                    value={form.parentPhone}
                    onChange={handleChange}
                    required
                    placeholder="VD: 0912345678"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Hàng 4: Email liên hệ phụ huynh */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email liên hệ phụ huynh</label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                <input 
                  type="email" 
                  name="parentEmail"
                  value={form.parentEmail}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email phụ huynh (Không bắt buộc)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Hàng 5: Địa chỉ của bé */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Địa chỉ thường trú</label>
              <div className="relative group">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                <input 
                  type="text" 
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Thành phố..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* CHÂN BUTTONS HÀNH ĐỘNG */}
            <div className="pt-5 flex items-center justify-end gap-3 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition duration-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              
              <motion.button
                whileHover={{ scale: loadingSubmit ? 1 : 1.015, y: -0.5 }}
                whileTap={{ scale: loadingSubmit ? 1 : 0.985 }}
                type="submit"
                disabled={loadingSubmit}
                className={`px-6 py-3 rounded-2xl text-xs font-bold text-white transition shadow-lg cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed ${
                  isEditMode 
                    ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-amber-600/15" 
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-600/15"
                }`}
              >
                {loadingSubmit ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang đồng bộ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isEditMode ? "Cập nhật" : "Lưu hồ sơ"}</span>
                  </>
                )}
              </motion.button>
            </div>

          </form>
        )}
      </motion.div>
    </div>
  );
};

export default StudentModal;