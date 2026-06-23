import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Loader2, 
  Save, 
  RefreshCw,
  Camera
} from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../../../api/userApi"; 

const ProfilePage = () => {
  const userId = localStorage.getItem("userId") || 1;
  const [activeTab, setActiveTab] = useState("info");

  const [infoForm, setInfoForm] = useState({ fullName: "", phone: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);

  useEffect(() => {
    userApi.getById(userId)
      .then(res => {
        const u = res.data.data;
        setInfoForm({ fullName: u.fullName || "", phone: u.phone || "", email: u.email || "" });
      })
      .catch(err => {
        console.error(err);
        toast.error("Không thể tải thông tin tài khoản.");
      });
  }, [userId]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoadingInfo(true);
    try {
      await userApi.updateInfo(userId, infoForm);
      toast.success("Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Hệ thống bận, vui lòng thử lại sau.");
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp!");
      return;
    }
    setLoadingPass(true);
    try {
      await userApi.changePassword(userId, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Thay đổi mật khẩu bảo mật thành công!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Mật khẩu hiện tại không chính xác.");
    } finally {
      setLoadingPass(false);
    }
  };

  // Lấy 2 chữ cái đầu để làm Avatar giả lập nếu chưa có ảnh
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 antialiased space-y-6 py-4">
      
      {/* 1. KHỐI PROFILE HEADER & TABS (GỘP CHUNG CAO CẤP) */}
      <div className="bg-white rounded-[32px] border border-slate-200/70 shadow-xs p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Background Decor mờ ảo phía sau */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* Khu vực Avatar Hoành tráng */}
          <div className="relative group">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl flex items-center justify-center text-white text-xl font-black shadow-xl shadow-indigo-600/20 uppercase tracking-wider border-4 border-white">
              {getInitials(infoForm.fullName)}
            </div>
            {/* Badge Active */}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
          </div>

          {/* Chi tiết định danh */}
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              {infoForm.fullName || "Người dùng Hệ thống"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">ID Tài khoản: #{userId}</p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Thành viên chính thức
            </div>
          </div>
        </div>

        {/* Thanh chuyển đổi Tab (Hàng ngang thiết kế lại mỏng và tinh tế hơn) */}
        <div className="flex bg-slate-100/80 p-1 rounded-2xl relative border border-slate-200/20">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 relative py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer z-10 ${
              activeTab === "info" ? "text-indigo-600 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <User className="w-3.5 h-3.5 stroke-[2.2]" />
            Hồ sơ cá nhân
            {activeTab === "info" && (
              <motion.div 
                layoutId="activeTabIndicatorPremium" 
                className="absolute inset-0 bg-white rounded-xl border border-slate-200/50 shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("password")}
            className={`flex-1 relative py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer z-10 ${
              activeTab === "password" ? "text-slate-900 font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            Bảo mật & Mật khẩu
            {activeTab === "password" && (
              <motion.div 
                layoutId="activeTabIndicatorPremium" 
                className="absolute inset-0 bg-white rounded-xl border border-slate-200/50 shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        </div>
      </div>

      {/* 2. KHU VỰC FORM NỘI DUNG CHUYỂN ĐỘNG */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200/70 shadow-xs overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "info" ? (
            <motion.div
              key="info-tab"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <form onSubmit={handleUpdateInfo} className="space-y-5">
                {/* Họ và tên */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Họ và Tên</label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                    <input 
                      type="text" 
                      value={infoForm.fullName} 
                      onChange={e => setInfoForm({...infoForm, fullName: e.target.value})} 
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Số điện thoại</label>
                  <div className="relative group">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                    <input 
                      type="text" 
                      value={infoForm.phone} 
                      onChange={e => setInfoForm({...infoForm, phone: e.target.value})} 
                      placeholder="Nhập số điện thoại di động"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email liên hệ</label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-600 transition-colors stroke-[2]" />
                    <input 
                      type="email" 
                      value={infoForm.email} 
                      onChange={e => setInfoForm({...infoForm, email: e.target.value})} 
                      placeholder="example@gmail.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Nút lưu */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                  <motion.button 
                    whileHover={{ scale: loadingInfo ? 1 : 1.015, y: -0.5 }}
                    whileTap={{ scale: loadingInfo ? 1 : 0.985 }}
                    disabled={loadingInfo}
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-7 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    {loadingInfo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang lưu đồng bộ...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu thay đổi</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="password-tab"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <form onSubmit={handleChangePassword} className="space-y-5">
                {/* Mật khẩu cũ */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mật khẩu hiện tại *</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-slate-900 transition-colors stroke-[2]" />
                    <input 
                      required 
                      type="password" 
                      value={passwordForm.oldPassword} 
                      onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} 
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mật khẩu mới *</label>
                  <div className="relative group">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-slate-900 transition-colors stroke-[2]" />
                    <input 
                      required 
                      type="password" 
                      value={passwordForm.newPassword} 
                      onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                      placeholder="Tối thiểu 6 ký tự bảo mật"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Xác nhận mật khẩu mới *</label>
                  <div className="relative group">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-slate-900 transition-colors stroke-[2]" />
                    <input 
                      required 
                      type="password" 
                      value={passwordForm.confirmPassword} 
                      onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                      placeholder="Nhập lại chính xác mật khẩu mới"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Nút lưu mật khẩu */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                  <motion.button 
                    whileHover={{ scale: loadingPass ? 1 : 1.015, y: -0.5 }}
                    whileTap={{ scale: loadingPass ? 1 : 0.985 }}
                    disabled={loadingPass}
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black disabled:opacity-60 disabled:cursor-not-allowed text-white px-7 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-slate-900/15 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    {loadingPass ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang xử lý mật mã...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Cập nhật bảo mật</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default ProfilePage;