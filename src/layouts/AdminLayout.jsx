import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast"; // Thêm Toaster toàn cục
import { 
  LayoutDashboard, Users, GraduationCap, School, 
  Menu, X, ChevronRight, LogOut, Bell, Search, Settings
} from "lucide-react";

const navItems = [
  { path: "/admin/dashboard", name: "Tổng quan", icon: LayoutDashboard },
  { path: "/admin/users", name: "Người dùng", icon: Users },
  { path: "/admin/classes", name: "Lớp học", icon: School },
  { path: "/admin/students", name: "Học sinh", icon: GraduationCap },
  { path: "/admin/settings", name: "Cài đặt", icon: Settings },
];

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();

  // Handle responsive sidebar automatically
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      {/* 1. Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 768 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* 2. Sidebar */}
      <motion.aside
        className={`fixed md:static z-50 h-screen w-72 bg-white border-r border-slate-200 shadow-2xl md:shadow-none flex flex-col`}
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold">A</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Admin<span className="text-indigo-600">Core</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors duration-300 ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <item.icon size={22} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <motion.div layoutId="active" className="ml-auto"><ChevronRight size={18} /></motion.div>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </motion.aside>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/50 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={24} className="text-slate-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-indigo-300 transition-all">
              <Search size={18} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Tìm kiếm..." className="bg-transparent outline-none w-full text-sm" />
            </div>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-800">Admin User</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;