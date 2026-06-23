import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Search, 
  User, 
  Calendar, 
  HeartHandshake, 
  MapPin, 
  Activity, 
  Pencil, 
  Users,
  Inbox,
  Mail,
  Phone,
  Filter,
  Hash
} from "lucide-react";
import { classApi } from "../../../api/classApi";
import { studentApi } from "../../../api/studentApi";
import StudentModal from "../components/StudentModal";

// Định nghĩa hiệu ứng trượt thác nước (Stagger Cascade Animation)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 14 } 
  }
};

const StudentsPage = () => {
  const teacherId = localStorage.getItem("userId") || 1;
  
  const [classId, setClassId] = useState(null);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadStudents = async () => {
    try {
      const classRes = await classApi.getByTeacher(teacherId);
      const cId = classRes.data.data?.id;
      setClassId(cId);
      
      if (cId) {
        const studentRes = await studentApi.getByClass(cId);
        setStudents(studentRes.data.data || studentRes.data);
      }
    } catch (error) {
      console.error("Lỗi đồng bộ danh sách học sinh:", error);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [teacherId]);

  const handleOpenCreate = () => {
    setSelectedStudentId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (id) => {
    setSelectedStudentId(id);
    setIsModalOpen(true);
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // TINH CHỈNH MÀU SẮC CONTAINER ICON THEO GIỚI TÍNH CHUẨN TAILWIND V4
  const getGenderStyle = (gender) => {
    const g = gender?.toLowerCase();
    if (g === "nam" || g === "male") return "bg-indigo-50 text-indigo-600 border-indigo-200/60";
    if (g === "nữ" || g === "female") return "bg-pink-50 text-pink-500 border-pink-200/60";
    return "bg-slate-50 text-slate-500 border-slate-200/60";
  };

  const formatGenderText = (gender) => {
    const g = gender?.toLowerCase();
    if (g === "nam" || g === "male") return "Nam";
    if (g === "nữ" || g === "female") return "Nữ";
    return gender || "Chưa rõ";
  };

  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const isActive = s === "active" || s === "đang học" || !status;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
      }`}>
        {isActive ? "Đang học" : "Nghỉ học"}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 antialiased">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Hồ Sơ Học Viên</h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Hệ thống quản lý thông tin, giới tính và liên hệ học viên.</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: !classId ? 1 : 1.015, y: -1 }}
          whileTap={{ scale: !classId ? 1 : 0.985 }}
          disabled={!classId}
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2 tracking-wide disabled:opacity-40 disabled:cursor-not-allowed ml-auto sm:ml-0"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" /> Thêm học sinh mới
        </motion.button>
      </div>

      {/* 2. FILTER & UTILITIES ROW */}
      <div className="grid grid-cols-1 sm:flex sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs">
        <div className="w-full sm:w-96 relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text"
            placeholder="Tìm kiếm học sinh theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2.5 justify-end">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-xs text-slate-500 font-bold transition cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Bộ lọc
          </button>
          <div className="text-[11px] text-slate-400 font-bold bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200/60">
            Sĩ số: <span className="text-indigo-600 font-extrabold">{filteredStudents.length}</span> học viên
          </div>
        </div>
      </div>

      {/* 3. CORE DESIGN DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left table-auto">
            <thead className="bg-slate-50/70 border-b border-slate-200/60 text-[10px] uppercase text-slate-400 font-bold tracking-widest">
              <tr>
                <th className="py-4 px-4 text-center w-12 text-slate-400"><span className="flex items-center justify-center gap-1"><Hash className="w-3 h-3" /> STT</span></th>
                <th className="py-4 px-6 min-w-[220px] text-slate-400"><span className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> Học viên / Giới tính</span></th>
                <th className="py-4 px-4 text-slate-400"><span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Ngày sinh & Địa chỉ</span></th>
                <th className="py-4 px-4 min-w-[240px] text-slate-400"><span className="flex items-center gap-2"><HeartHandshake className="w-3.5 h-3.5" /> Thông tin phụ huynh</span></th>
                <th className="py-4 px-4 text-slate-400"><span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Trạng thái</span></th>
                <th className="py-4 px-6 text-center text-slate-400">Hành động</th>
              </tr>
            </thead>
            
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-xs text-slate-600 divide-y divide-slate-100 font-semibold"
            >
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, index) => (
                  <motion.tr 
                    key={s.id} 
                    variants={rowVariants}
                    whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.9)", scale: 1.002 }}
                    className="transition-all duration-150 group"
                  >
                    {/* Cột số thứ tự */}
                    <td className="py-4 px-4 text-center align-middle font-bold text-slate-400 text-xs">
                      {index + 1}
                    </td>

                    {/* Cột 1: Tên + Giới tính (Đã dọn hoàn toàn ô vuông lỗi số 1) */}
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-3">
                        {/* Thay thế số thô bằng Icon User đồng bộ màu giới tính */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-105 ${getGenderStyle(s.gender)}`}>
                          <User className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-indigo-600 transition-colors truncate">{s.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Giới tính: <span className="font-bold text-slate-500">{formatGenderText(s.gender)}</span></p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Cột 2: Ngày sinh & Địa chỉ */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex flex-col">
                        <p className="text-slate-700 font-bold">{s.dateOfBirth}</p>
                        <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px] mt-0.5 max-w-[180px]" title={s.address}>
                          <MapPin className="w-3 h-3 shrink-0 text-slate-300" />
                          <span className="truncate">{s.address || "Chưa cập nhật"}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Cột 3: Người bảo hộ + SĐT + Email */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 font-bold text-[13px]">{s.parentName}</span>
                          <span className="inline-flex items-center gap-0.5 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight">
                            <Phone className="w-2.5 h-2.5 text-slate-400" /> {s.parentPhone}
                          </span>
                        </div>
                        {s.parentEmail ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1 max-w-[220px]" title={s.parentEmail}>
                            <Mail className="w-3 h-3 text-slate-300 shrink-0" /> 
                            <span className="truncate">{s.parentEmail}</span>
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-300 font-medium mt-1">Chưa cập nhật Email</p>
                        )}
                      </div>
                    </td>
                    
                    {/* Cột 4: Trạng thái */}
                    <td className="py-4 px-4 align-middle">
                      <div className="flex items-center">
                        {renderStatusBadge(s.status)}
                      </div>
                    </td>
                    
                    {/* Cột 5: Nút Sửa */}
                    <td className="py-4 px-6 text-center align-middle">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => handleOpenEdit(s.id)} 
                          className="inline-flex items-center justify-center w-8 h-8 bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-xl transition-all duration-150 cursor-pointer border border-slate-150 shadow-xs"
                          title="Chỉnh sửa hồ sơ"
                        >
                          <Pencil className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl text-slate-300">
                        <Inbox className="w-8 h-8 stroke-[1.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-800 font-bold">Không có kết quả trùng khớp</p>
                        <p className="text-[11px] text-slate-400 font-medium">Kiểm tra lại từ khóa hoặc thêm học sinh mới.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* DIALOG/MODAL ACTIONS */}
      <AnimatePresence>
        {isModalOpen && (
          <StudentModal
            classId={classId}
            studentId={selectedStudentId}
            onClose={() => setIsModalOpen(false)}
            onSaveSuccess={() => {
              setIsModalOpen(false);
              loadStudents();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentsPage;