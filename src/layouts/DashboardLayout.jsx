import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Bell,
  ChevronRight
} from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // ĐỒNG BỘ: Cập nhật lại đường dẫn khớp chính xác với App.jsx
  const menuItems = [
    { text: "Tổng quan Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
    { text: "Điểm danh lớp học", path: "/teacher/attendance", icon: CalendarCheck },
    { text: "Quản lý học sinh", path: "/teacher/students", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-100/60 font-sans tracking-tight antialiased text-slate-800">
      
      {/* 📱 MOBILE SIDEBAR DRAWER (OVERLAY) */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white z-50 flex flex-col justify-between p-6 shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-black tracking-wider text-base uppercase">LAM ĐIỀN</span>
                  </div>
                  <button onClick={() => setIsMobileOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl transition">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <nav className="mt-6 space-y-1.5">
                  {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const selected = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          selected ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-4 h-4 shrink-0" />
                          <span>{item.text}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${selected ? "text-white" : "text-slate-500"}`} />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-rose-500/10"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 🖥️ DESKTOP SIDEBAR PANEL */}
      <div className="hidden md:flex w-68 bg-slate-900 text-white flex-col justify-between shrink-0 border-r border-slate-800/40 p-5">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/60">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-black text-sm tracking-widest uppercase bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              LAM ĐIỀN
            </span>
          </div>

          <nav className="space-y-1 relative">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const selected = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 relative overflow-hidden ${
                    selected ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {selected && (
                    <motion.div 
                      layoutId="sidebarActiveBg"
                      className="absolute inset-0 bg-indigo-600 -z-0 shadow-lg shadow-indigo-600/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <IconComponent className="w-4 h-4 z-10 shrink-0" />
                  <span className="z-10">{item.text}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-rose-600/90 text-slate-300 hover:text-white py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700/40 hover:border-transparent active:scale-98"
          >
            <LogOut className="w-4 h-4" /> <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* RIGHT WORKSPACE AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md h-16 flex items-center justify-between md:justify-end px-4 sm:px-6 border-b border-slate-200/60 relative z-30">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-600/10">
                GV
              </div>
              <span className="text-xs font-bold text-slate-700">Giáo Viên</span>
            </div>
          </div>
        </header>

        {/* NỘI DUNG THAY ĐỔI CỦA PAGE */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;