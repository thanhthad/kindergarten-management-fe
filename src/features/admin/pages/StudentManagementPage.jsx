import React, { useEffect, useState } from "react";
import { studentApi } from "../../../api/studentApi";
import { classApi } from "../../../api/classApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, Eye, Edit2, Trash2, Search, SlidersHorizontal, 
  MapPin, Phone, Mail, Calendar, User, Shield, X, 
  ChevronLeft, ChevronRight, Loader2, Info
} from "lucide-react";

const StudentManagementPage = () => {

  // ================= STATE =================
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);

  // ================= FILTER (MATCH BACKEND) =================
  const [filter, setFilter] = useState({
    classId: "",
    name: "",
    address: ""
  });

  // ================= MODAL =================
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [selected, setSelected] = useState(null);

  // ================= FORM (FULL FIELD BACKEND) =================
  const [form, setForm] = useState({
    classId: "",
    fullName: "",
    gender: "MALE",
    dateOfBirth: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    status: "ACTIVE"
  });

  // ================= BUILD PARAMS (IMPORTANT FIX) =================
  const buildParams = (pageIndex) => ({
    page: pageIndex,
    size,
    classId: filter.classId ? Number(filter.classId) : undefined,
    name: filter.name || undefined,
    address: filter.address || undefined
  });

  // ================= GET STUDENTS =================
  const fetchStudents = async (pageIndex = 0) => {
    try {
      setLoading(true);
      const res = await studentApi.search(buildParams(pageIndex));
      const data = res.data?.data;

      setStudents(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setPage(pageIndex);
    } catch (err) {
      toast.error("Không load được danh sách học sinh");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= GET CLASSES =================
  const fetchClasses = async () => {
    try {
      const res = await classApi.getAll({ page: 0, size: 100 });
      setClasses(res.data?.data?.content || []);
    } catch {
      toast.error("Không load được danh sách lớp");
    }
  };

  useEffect(() => {
    fetchStudents(0);
    fetchClasses();
  }, []);

  // ================= CREATE =================
  const openCreate = () => {
    setMode("create");
    setForm({
      classId: "",
      fullName: "",
      gender: "MALE",
      dateOfBirth: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      address: "",
      status: "ACTIVE"
    });
    setOpenModal(true);
  };

  // ================= EDIT =================
  const openEdit = (s) => {
    setMode("edit");
    setSelected(s);

    setForm({
      classId: s.classId,
      fullName: s.fullName,
      gender: s.gender || "MALE",
      dateOfBirth: s.dateOfBirth,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      parentEmail: s.parentEmail,
      address: s.address,
      status: s.status
    });

    setOpenModal(true);
  };

  // ================= VIEW =================
  const openView = (s) => {
    setMode("view");
    setSelected(s);
    setOpenModal(true);
  };

  // ================= SUBMIT (CREATE + UPDATE FULL FIELD) =================
  const handleSubmit = async () => {
    try {
      if (!form.fullName || !form.classId || !form.dateOfBirth) {
        return toast.error("Thiếu thông tin bắt buộc");
      }

      const payload = {
        classId: Number(form.classId),
        fullName: form.fullName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        parentEmail: form.parentEmail,
        address: form.address,
        status: form.status
      };

      if (mode === "create") {
        await studentApi.create(payload);
        toast.success("Tạo học sinh thành công");
      }

      if (mode === "edit") {
        await studentApi.update(selected.id, payload);
        toast.success("Cập nhật thành công");
      }

      setOpenModal(false);
      fetchStudents(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi thao tác");
      console.log(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá học sinh này?")) {
      try {
        await studentApi.delete(id);
        toast.success("Xoá thành công");
        fetchStudents(page);
      } catch {
        toast.error("Xoá thất bại");
      }
    }
  };

  // ================= SEARCH =================
  const handleSearch = () => {
    fetchStudents(0);
  };

  // Định nghĩa animation config cho Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen text-slate-800 antialiased font-sans selection:bg-blue-500 selection:text-white">
      
      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-900">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <Users size={24} />
            </div>
            Quản lý học sinh
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-1 hidden sm:block">Xem, thêm mới và tinh chỉnh thông tin học viên hệ thống</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-medium shadow-md shadow-blue-500/10 transition-all"
        >
          <Plus size={18} /> Thêm học sinh mới
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* FILTER BAR */}
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
            <SlidersHorizontal size={16} className="text-blue-600" />
            Bộ lọc tìm kiếm
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <input
                placeholder="Tìm tên học sinh..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                onChange={(e) => setFilter({ ...filter, name: e.target.value })}
              />
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>

            <div className="relative">
              <input
                placeholder="Tìm theo địa chỉ..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                onChange={(e) => setFilter({ ...filter, address: e.target.value })}
              />
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>

            <div>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-600"
                onChange={(e) => setFilter({ ...filter, classId: e.target.value })}
              >
                <option value="">Tất cả lớp học</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Search size={15} /> Áp dụng bộ lọc
            </motion.button>
          </div>
        </div>

        {/* LIST / TABLE DATA */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-slate-400 text-sm font-medium">Đang tải dữ liệu học sinh...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-medium">Không tìm thấy học sinh nào</p>
              <p className="text-slate-400 text-xs mt-1">Vui lòng thử thay đổi tiêu chí bộ lọc</p>
            </div>
          ) : (
            <>
              {/* Desktop View (Table) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-4 px-6">Học sinh</th>
                      <th className="py-4 px-6">Lớp & Địa chỉ</th>
                      <th className="py-4 px-6">Phụ huynh</th>
                      <th className="py-4 px-6 text-center">Trạng thái</th>
                      <th className="py-4 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <motion.tbody 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-slate-100 text-sm text-slate-700"
                  >
                    {students.map((s) => (
                      <motion.tr key={s.id} variants={itemVariants} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{s.fullName}</div>
                          <div className="mt-0.5 text-xs text-slate-400 font-medium">Giới tính: {s.gender}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-xs mb-1">
                            {s.className || "Chưa xếp lớp"}
                          </span>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400 shrink-0" /> {s.address || "---"}
                          </div>
                        </td>
                        <td className="py-4 px-6 space-y-0.5">
                          <div className="font-medium text-slate-800 text-xs">{s.parentName || "---"}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone size={11} /> {s.parentPhone || "---"}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openView(s)} className="p-2 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors" title="Xem chi tiết">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => openEdit(s)} className="p-2 hover:bg-slate-100 text-slate-600 hover:text-amber-600 rounded-lg transition-colors" title="Sửa">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition-colors" title="Xoá">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              {/* Mobile View (iPhone Responsive Layout Cards) */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="block md:hidden divide-y divide-slate-100"
              >
                {students.map((s) => (
                  <motion.div key={s.id} variants={itemVariants} className="p-4 space-y-3 active:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{s.fullName}</h3>
                        <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-xs">
                          Lớp {s.className || "N/A"}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                      <div><span className="text-slate-400 font-medium">Giới tính:</span> {s.gender}</div>
                      <div className="truncate"><span className="text-slate-400 font-medium">Địa chỉ:</span> {s.address || "---"}</div>
                      <div className="col-span-2 truncate"><span className="text-slate-400 font-medium">PH:</span> {s.parentName} {s.parentPhone && `(${s.parentPhone})`}</div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-dashed border-slate-100">
                      <button onClick={() => openView(s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-lg active:bg-slate-200">
                        <Eye size={14} /> Chi tiết
                      </button>
                      <button onClick={() => openEdit(s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 font-medium text-xs rounded-lg active:bg-amber-100">
                        <Edit2 size={14} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 font-medium text-xs rounded-lg active:bg-red-100">
                        <Trash2 size={14} /> Xoá
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-xs md:text-sm text-slate-500">
              Trang <span className="font-semibold text-slate-800">{page + 1}</span> / {totalPages}
            </div>
            
            <div className="flex gap-1.5">
              <button 
                disabled={page === 0} 
                onClick={() => fetchStudents(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <button 
                disabled={page + 1 >= totalPages} 
                onClick={() => fetchStudents(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POPUP MODAL WITH FRAMER-MOTION */}
      <AnimatePresence>
        {openModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
            
            {/* Backdrop layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ 
                opacity: 0, 
                y: window.innerWidth < 768 ? "100%" : 30 
              }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ 
                opacity: 0, 
                y: window.innerWidth < 768 ? "100%" : 15 
              }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative bg-white w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] md:max-h-none flex flex-col"
            >
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
                <h2 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                  {mode === "view" && <Info size={18} className="text-blue-500" />}
                  {mode === "create" && <Plus size={18} className="text-emerald-500" />}
                  {mode === "edit" && <Edit2 size={18} className="text-amber-500" />}
                  {mode === "create" ? "Thêm học sinh mới" : mode === "edit" ? "Cập nhật thông tin" : "Chi tiết lý lịch học sinh"}
                </h2>
                <button 
                  onClick={() => setOpenModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content Scroll */}
              <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
                
                {mode === "view" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-1"><span className="text-xs text-slate-400 block font-medium">Họ và tên</span><p className="font-semibold text-slate-900 flex items-center gap-1.5"><User size={14}/> {selected?.fullName}</p></div>
                    <div className="space-y-1"><span className="text-xs text-slate-400 block font-medium">Lớp học hiện tại</span><p className="font-semibold text-blue-700">{selected?.className || "Chưa xếp lớp"}</p></div>
                    <div className="space-y-1"><span className="text-xs text-slate-400 block font-medium">Giới tính</span><p className="font-medium">{selected?.gender}</p></div>
                    <div className="space-y-1"><span className="text-xs text-slate-400 block font-medium">Ngày tháng năm sinh</span><p className="font-medium flex items-center gap-1.5"><Calendar size={14}/> {selected?.dateOfBirth}</p></div>
                    <div className="space-y-1 sm:col-span-2 border-t border-slate-200/60 pt-2 mt-1"></div>
                    <div className="space-y-1"><span className="text-xs text-slate-400 block font-medium">Người giám hộ (Phụ huynh)</span><p className="font-semibold text-slate-800">{selected?.parentName || "---"}</p></div>
                    <div className="space-y-1"><span className="text-xs text-slate-400 block font-medium">Số điện thoại liên hệ</span><p className="font-medium text-slate-800 flex items-center gap-1.5"><Phone size={14}/> {selected?.parentPhone || "---"}</p></div>
                    <div className="space-y-1 sm:col-span-2"><span className="text-xs text-slate-400 block font-medium">Địa chỉ Email</span><p className="font-medium flex items-center gap-1.5"><Mail size={14}/> {selected?.parentEmail || "---"}</p></div>
                    <div className="space-y-1 sm:col-span-2"><span className="text-xs text-slate-400 block font-medium">Địa chỉ thường trú</span><p className="font-medium flex items-center gap-1.5"><MapPin size={14}/> {selected?.address || "---"}</p></div>
                    <div className="space-y-1 sm:col-span-2"><span className="text-xs text-slate-400 block font-medium">Trạng thái hồ sơ</span><span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full mt-0.5 ${selected?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{selected?.status}</span></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Họ tên học sinh <span className="text-red-500">*</span></label>
                      <input
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Nhập đầy đủ họ tên"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Lớp học <span className="text-red-500">*</span></label>
                      <select
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-700"
                        value={form.classId}
                        onChange={(e) => setForm({ ...form, classId: e.target.value })}
                      >
                        <option value="">Chọn lớp học</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Giới tính</label>
                      <select
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-700"
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      >
                        <option value="MALE">Nam (MALE)</option>
                        <option value="FEMALE">Nữ (FEMALE)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Ngày sinh <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-700"
                        value={form.dateOfBirth}
                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Tên phụ huynh</label>
                      <input
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Họ tên cha hoặc mẹ"
                        value={form.parentName}
                        onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Số điện thoại liên lạc</label>
                      <input
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Nhập số điện thoại di động"
                        value={form.parentPhone}
                        onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-500">Địa chỉ Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="viethocsinh@example.com"
                        value={form.parentEmail}
                        onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-500">Địa chỉ thường trú</label>
                      <input
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                        placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-500">Trạng thái hoạt động</label>
                      <select
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all text-slate-700"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="ACTIVE">Đang học (ACTIVE)</option>
                        <option value="INACTIVE">Thôi học / Đình chỉ (INACTIVE)</option>
                      </select>
                    </div>

                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 pb-6 md:pb-4">
                <button 
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 transition-all"
                >
                  {mode === "view" ? "Đóng lại" : "Hủy bỏ"}
                </button>

                {mode !== "view" && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                  >
                    Lưu dữ liệu
                  </motion.button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentManagementPage;