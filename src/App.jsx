import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // 1. IMPORT TOASTER CHUẨN DOANH NGHIỆP Ở ĐÂY

import Login from "./features/auth/pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./features/teacher/pages/Dashboard";
import ProfilePage from "./features/teacher/pages/ProfilePage";
import ClassPage from "./features/teacher/pages/ClassPage";
import StudentsPage from "./features/teacher/pages/StudentsPage";

function App() {
  return (
    <BrowserRouter>
      {/* 2. ĐẶT TOASTER Ở ĐÂY ĐỂ HIỂN THỊ THÔNG BÁO TOÀN HỆ THỐNG */}
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          // Cấu hình font chữ và bo góc chung cho toàn bộ toast nhìn cho pro
          style: {
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '16px',
            fontFamily: 'sans-serif'
          }
        }}
      />

      <Routes>
        {/* HỆ THỐNG AUTH */}
        <Route path="/login" element={<Login />} />

        {/* HỆ THỐNG TEACHER - Kế thừa giao diện từ DashboardLayout */}
        <Route path="/teacher" element={<DashboardLayout />}>
          {/* Tự động hướng vào trang dashboard khi vào /teacher */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="class" element={<ClassPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Bất kỳ route lạ nào cũng đẩy về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;