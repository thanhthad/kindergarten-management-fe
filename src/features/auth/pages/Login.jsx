import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, GraduationCap, ShieldAlert, CheckCircle2 } from "lucide-react";
import { authApi } from "../../../api/authApi";

// Animation Variants cấu hình chuẩn chuyển động mượt mà
const fadeUpVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: custom * 0.1 }
  })
};

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Tự động đóng toast sau 4 giây
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login(formData);
      console.log(res.data);
      const loginData = res.data.data;

      localStorage.setItem("accessToken", loginData.accessToken);
      localStorage.setItem("refreshToken", loginData.refreshToken);
      localStorage.setItem("userId", loginData.userId);

      setToast({ show: true, message: "Đăng nhập thành công! Đang chuyển hướng...", type: "success" });
      setTimeout(() => {
        navigate("/teacher/dashboard");
      }, 1000);

    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      setToast({
        show: true,
        message: error.response?.data?.message || "Email hoặc mật khẩu không đúng",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans tracking-tight antialiased selection:bg-indigo-600 selection:text-white overflow-hidden">
      
      {/* 🔔 HỆ THỐNG TOAST THAY THẾ ALERT MẶC ĐỊNH */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-4 left-4 sm:left-auto z-50 flex items-center gap-3 p-4 rounded-2xl shadow-2xl text-white backdrop-blur-md max-w-sm sm:w-96 border ${
              toast.type === "success" ? "bg-emerald-600/95 border-emerald-500" : "bg-rose-600/95 border-rose-500"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
            <p className="text-xs font-semibold tracking-wide flex-1">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎨 BÊN TRÁI: BANNER THƯƠNG HIỆU VISUAL CỰC ĐẸP */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-700 via-blue-600 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Các vòng tròn làm mờ decor chạy background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-2xl -ml-16 -mb-16" />

        <div className="relative z-10 flex items-center gap-2.5 text-white">
          <div className="p-2 bg-white/10 border border-white/10 rounded-xl backdrop-blur-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-black text-lg uppercase tracking-widest">KidAttend</span>
        </div>

        <div className="relative z-10 my-auto max-w-md">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-black text-white leading-tight tracking-tight"
          >
            Nền tảng điểm danh <br />& Quản lý học sinh thông minh.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-indigo-100 text-sm mt-4 font-medium leading-relaxed"
          >
            Giải pháp đồng bộ realtime tối ưu hóa thời gian lên lớp cho giáo viên mầm non và tiểu học.
          </motion.p>
        </div>

        <div className="relative z-10 text-xs text-white/40 font-semibold tracking-widest uppercase">
          © {new Date().getFullYear()} KidAttend Security Ecosystem
        </div>
      </div>

      {/* 🔐 BÊN PHẢI: WORKSPACE FORM ĐĂNG NHẬP */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white/40 backdrop-blur-md relative">
        <div className="w-full max-w-sm flex flex-col">
          
          {/* Logo hiển thị riêng ở Mobile layout */}
          <div className="flex items-center gap-2 mb-8 md:hidden justify-center">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-black text-lg text-slate-800 uppercase tracking-widest">KidAttend</span>
          </div>

          {/* Tiêu đề Form */}
          <div className="mb-8 text-center md:text-left">
            <motion.h1 
              custom={0} variants={fadeUpVariants} initial="hidden" animate="visible"
              className="text-2xl font-black text-slate-800 tracking-tight sm:text-3xl"
            >
              Chào mừng trở lại 👋
            </motion.h1>
            <motion.p 
              custom={1} variants={fadeUpVariants} initial="hidden" animate="visible"
              className="text-slate-400 text-xs mt-1 font-medium"
            >
              Vui lòng đăng nhập tài khoản giáo viên để tiếp tục làm việc.
            </motion.p>
          </div>

          {/* Form Hành Động */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input Hòm thư Email */}
            <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Địa chỉ Email
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xs placeholder:text-slate-400"
                  placeholder="name@kidattend.com"
                />
              </div>
            </motion.div>

            {/* Input Mật khẩu Security */}
            <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Mật khẩu bảo mật
                </label>
                <a href="#forgot" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Quên mật khẩu thì chịu?
                </a>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xs placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Nút Submit điều khiển trạng thái */}
            <motion.div custom={4} variants={fadeUpVariants} initial="hidden" animate="visible" className="pt-2">
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chứng thực tài khoản...</span>
                  </>
                ) : (
                  <span>Đăng nhập hệ thống</span>
                )}
              </motion.button>
            </motion.div>

          </form>

        </div>
      </div>

    </div>
  );
}

export default Login;