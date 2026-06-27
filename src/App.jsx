import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./features/auth/pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentsPage from "./features/teacher/pages/StudentsPage";
import UserManagementPage from "./features/admin/pages/UserManagementPage";
import ClassManagementPage from "./features/admin/pages/ClassManagementPage";
import Dashboard from "./features/teacher/pages/Dashboard";
import AttendancePage from "./features/teacher/pages/AttendancePage";
import StudentManagementPage from "./features/admin/pages/StudentManagementPage";
import TeacherStudentPage from "./features/teacher/pages/TeacherStudentPage";
import AttendanceManagementPage from "./features/admin/pages/AttendanceManagementPage";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "13px",
            fontWeight: "600",
            borderRadius: "16px",
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ================= TEACHER ROUTES ================= */}
        <Route path="/teacher" element={<DashboardLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<AttendancePage />} />

          <Route path="studentAttendance" element={<StudentsPage />} />
          <Route path="students" element={<TeacherStudentPage />} />
        </Route>

        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/classes" element={<ClassManagementPage />} />
        <Route path="/students" element={<StudentManagementPage />} />
        <Route path="/attendance" element={<AttendanceManagementPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;