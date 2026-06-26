import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./features/auth/pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./features/teacher/pages/Dashboard";
import AttendancePage from "./features/teacher/pages/AttendancePage";
import StudentsPage from "./features/teacher/pages/StudentsPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { fontSize: '13px', fontWeight: '600', borderRadius: '16px' }
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Khớp nối chuẩn chỉnh hệ thống route */}
        <Route path="/teacher" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="students" element={<StudentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;