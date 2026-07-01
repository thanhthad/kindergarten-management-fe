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
  UserCheck
} from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { text: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard },
    { text: "Điểm danh", path: "/teacher/attendance", icon: CalendarCheck },
    { text: "Học sinh", path: "/teacher/students", icon: Users },
    { text: "Theo dõi", path: "/teacher/studentAttendance", icon: UserCheck }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const spring = { type: "spring", stiffness: 380, damping: 35 };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800">

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={spring}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#0f1123] text-white z-50 p-5"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <GraduationCap />
                  <b>LAM ĐIỀN</b>
                </div>

                <button onClick={() => setIsMobileOpen(false)}>
                  <X />
                </button>
              </div>

              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        active ? "bg-indigo-600 text-white" : "text-slate-300"
                      }`}
                    >
                      <Icon size={18} />
                      {item.text}
                    </Link>
                  );
                })}
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full bg-red-500 p-3 rounded-lg"
              >
                Đăng xuất
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-72 bg-[#0f1123] text-white flex-col justify-between">

        <div className="p-5">
          <div className="flex items-center gap-2 mb-8">
            <GraduationCap />
            <b>LAM ĐIỀN</b>
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    active ? "bg-indigo-600" : "text-slate-300"
                  }`}
                >
                  <Icon size={18} />
                  {item.text}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 p-3 rounded-lg"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {/* MAIN AREA - FIX CHÍNH */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* MOBILE MENU BUTTON */}
        <div className="md:hidden p-3">
          <button onClick={() => setIsMobileOpen(true)}>
            <Menu />
          </button>
        </div>

        {/* CONTENT AREA (KHÔNG HEADER, KHÔNG BUG FIXED) */}
        <main className="flex-1 overflow-y-auto p-4 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;