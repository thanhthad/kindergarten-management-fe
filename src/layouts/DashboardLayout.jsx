import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Bell,
  ChevronRight,
  UserCheck
} from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    const loadingToast = toast.loading("Đang đăng xuất an toàn...");
    
    setTimeout(() => {
      localStorage.clear();
      toast.dismiss(loadingToast);
      toast.success("Hẹn gặp lại bạn nhé! 👋", {
        style: {
          borderRadius: "16px",
          background: "#1e1b4b",
          color: "#fff",
          border: "1px solid rgba(99, 102, 241, 0.2)"
        },
      });
      navigate("/login");
    }, 800);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { text: "Tổng quan Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
    { text: "Điểm danh lớp học", path: "/teacher/attendance", icon: CalendarCheck },
    { text: "Quản lý học sinh", path: "/teacher/students", icon: Users },
    { text: "Theo dõi điểm danh", path: "/teacher/studentAttendance", icon: UserCheck },
  ];

  const iosSpring = { type: "spring", stiffness: 380, damping: 35 };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans tracking-tight antialiased text-slate-800 selection:bg-indigo-600 selection:text-white">
      
      {/* 📱 MOBILE SIDEBAR DRAWER (OVERLAY FOR IPHONE/MOBILE) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop mịn với độ mờ cao chuẩn iOS */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md z-40 md:hidden"
            />
            
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={iosSpring}
              className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-[#0f1123] via-[#13162f] to-[#0b0c16] text-white z-50 flex flex-col justify-between p-6 shadow-[5px_0_30px_rgba(0,0,0,0.5)] md:hidden pb-safe"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-indigo-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-black tracking-widest text-base uppercase bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                      LAM ĐIỀN
                    </span>
                  </div>
                  
                  <motion.button 
                    whileTap={{ scale: 0.9, rotate: 90 }}
                    onClick={() => setIsMobileOpen(false)} 
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white border border-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <nav className="mt-6 space-y-1.5">
                  {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    const selected = isActive(item.path);
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 + 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`group flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all relative ${
                            selected ? "text-white font-bold" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {selected && (
                            <motion.div 
                              layoutId="mobileActiveBg"
                              className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 -z-10 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] border border-indigo-400/20"
                              transition={iosSpring}
                            />
                          )}
                          
                          {/* Hiệu ứng hover nhẹ trên mobile */}
                          {!selected && (
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-all duration-200 -z-10" />
                          )}

                          <div className="flex items-center gap-3.5">
                            <IconComponent className={`w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${selected ? "text-white" : "text-indigo-400/80 group-hover:text-indigo-400"}`} />
                            <span>{item.text}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${selected ? "text-white translate-x-0" : "text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-indigo-500/10 mb-safe-bottom">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLogout}
                  className="w-full bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white py-3.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-rose-500/20 shadow-sm shadow-rose-950/20"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🖥️ DESKTOP SIDEBAR PANEL (Premium Dark Glow) */}
      <div className="hidden md:flex w-76 bg-gradient-to-b from-[#0f1123] via-[#121429] to-[#090a14] text-white flex-col justify-between shrink-0 border-r border-indigo-500/10 p-6 relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.15)]">
        <div>
          {/* Logo Brand Brand với hiệu ứng Gradient Text bạc/trắng cao cấp */}
          <div className="flex items-center gap-3.5 px-2 py-4 mb-8 border-b border-indigo-500/10">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 8, filter: "brightness(1.2)" }}
              className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] cursor-pointer"
            >
              <GraduationCap className="w-5 h-5" />
            </motion.div>
            <span className="font-black text-sm tracking-widest uppercase bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              LAM ĐIỀN
            </span>
          </div>

          {/* Điều hướng Desktop với hiệu ứng Glow trượt */}
          <nav className="space-y-2 relative">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const selected = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all duration-300 relative overflow-hidden group ${
                    selected ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {selected && (
                    <motion.div 
                      layoutId="sidebarActiveBg"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 -z-10 shadow-[0_4px_25px_rgba(79,70,229,0.35)] border border-indigo-400/20"
                      transition={iosSpring}
                    />
                  )}

                  {/* Lớp nền hover mịn cho các nút chưa active */}
                  {!selected && (
                    <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-all duration-300 rounded-xl -z-10" />
                  )}

                  <IconComponent className={`w-4.5 h-4.5 z-10 shrink-0 transition-transform duration-300 group-hover:rotate-3 ${selected ? "text-white" : "text-indigo-400/70 group-hover:text-indigo-400"}`} />
                  <span className="z-10 tracking-wide">{item.text}</span>
                  
                  {!selected && (
                    <span className="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500/70" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Nút Đăng xuất Neon Rose */}
        <div className="pt-4 border-t border-indigo-500/10">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(244, 63, 94, 0.15)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full bg-slate-800/40 hover:text-rose-400 text-slate-300 py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700/30 shadow-sm group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 group-hover:-translate-x-0.5 transition-all" /> 
            <span>Đăng xuất</span>
          </motion.button>
        </div>
      </div>

      {/* RIGHT WORKSPACE AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* HEADER BAR (Siêu mờ mịn - Glassmorphic Header) */}
        <header className="bg-white/60 backdrop-blur-xl h-16 flex items-center justify-between md:justify-end px-4 sm:px-8 border-b border-slate-200/40 relative z-30">
          
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2.5 text-slate-700 bg-white/80 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-200/50"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-4">
            
            {/* Nút thông báo với chuông rung và chấm đỏ pulse phát sáng */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast('Hệ thống hoạt động mượt mà!', { icon: '🚀' })}
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all relative border border-transparent hover:border-indigo-100/40"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full ring-2 ring-white shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            </motion.button>
            
            <div className="w-px h-5 bg-slate-200/80" />
            
            {/* Khối User dạng Viên thuốc tinh tế */}
            <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 bg-white/80 hover:bg-white rounded-full border border-slate-200/60 shadow-xs transition-all cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                GV
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">Giáo Viên</span>
                <span className="text-[10px] text-slate-400 font-medium">lamdien@edu.vn</span>
              </div>
            </div>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH CỦA TRANG VỚI ANIMATION ĐỔI TRANG MƯỢT MÀ */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-tr from-slate-50 via-[#f8fafc] to-indigo-50/20 p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;