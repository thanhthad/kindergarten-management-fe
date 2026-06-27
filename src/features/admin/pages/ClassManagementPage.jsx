import React, { useEffect, useState } from "react";
import { classApi } from "../../../api/classApi";
import { userApi } from "../../../api/userApi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Search, 
  Plus, 
  GraduationCap, 
  User, 
  Users, 
  Calendar, 
  FileText, 
  Eye, 
  Edit2, 
  Trash2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";

const ClassManagementPage = () => {
  // ================= STATE (GIỮ NGUYÊN LOGIC) =================
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState({
    name: "",
    status: "",
  });

  const [selectedClass, setSelectedClass] = useState(null);
  const [mode, setMode] = useState("create"); // create | edit | view
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null); // Thay cho window.confirm

  const [form, setForm] = useState({
    name: "",
    age: 1,
    capacity: 10,
    teacherId: "",
    description: "",
  });

  // ================= LOAD CLASSES =================
  const fetchClasses = async (pageIndex = page) => {
    try {
      setLoading(true);
      const res = search.name || search.status
        ? await classApi.search({ ...search, page: pageIndex, size })
        : await classApi.getAll({ page: pageIndex, size });

      const data = res.data?.data || res.data;
      setClasses(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD TEACHERS =================
  const fetchTeachers = async () => {
    try {
      const res = await userApi.getAll({ page: 0, size: 100 });
      const data = res.data?.data || res.data;
      setTeachers(data.content || []);
    } catch (err) {
      toast.error("Không thể tải danh sách giáo viên");
    }
  };

  // ================= INIT =================
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  // ================= OPEN MODAL =================
  const openCreate = () => {
    setMode("create");
    setForm({
      name: "",
      age: 1,
      capacity: 10,
      teacherId: "",
      description: "",
    });
    setOpenModal(true);
  };

  const openEdit = (cls) => {
    setMode("edit");
    setSelectedClass(cls);
    setForm({
      name: cls.name,
      age: cls.age,
      capacity: cls.capacity,
      teacherId: cls.teacher?.id || "",
      description: cls.description || "",
    });
    setOpenModal(true);
  };

  const openView = async (id) => {
    try {
      const res = await classApi.getById(id);
      setSelectedClass(res.data?.data || res.data);
      setMode("view");
      setOpenModal(true);
    } catch {
      toast.error("Không thể tải chi tiết lớp học");
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Vui lòng nhập tên lớp học");
        return;
      }
      if (mode === "create") {
        await classApi.create(form);
        toast.success("Tạo lớp học thành công 🎉");
      } else if (mode === "edit") {
        await classApi.update(selectedClass.id, form);
        toast.success("Cập nhật thông tin thành công ✨");
      }
      setOpenModal(false);
      fetchClasses();
    }  catch (err) {

}
  };

  // ================= DELETE =================
  const confirmDelete = async () => {
    try {
      await classApi.delete(deleteId);
      toast.success("Đã xóa lớp học thành công");
      setDeleteId(null);
      fetchClasses();
    } catch {
      toast.error("Xóa lớp học thất bại");
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchClasses(0);
  };

  const filterByTeacher = async (teacherId) => {
    if (!teacherId) return fetchClasses();
    try {
      setLoading(true);
      const res = await classApi.getByTeacher(teacherId);
      const data = res.data?.data || res.data;
      setClasses([data]);
      setTotalPages(1);
    } catch {
      toast.error("Lọc theo giáo viên thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants cho List Items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-6 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      <div className="mx-auto max-w-7xl">
        
        {/* HEADER AREA */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              Quản Lý Lớp Học
            </h1>
            <p className="text-sm text-slate-500 mt-1">Quản lý danh sách, học viên và phân công giáo viên giảng dạy.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors w-full md:w-auto"
          >
            <Plus className="h-4 w-4" />
            Thêm lớp học mới
          </motion.button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-xs border border-slate-100 md:grid-cols-12 mb-6">
          <div className="relative md:col-span-5">
            <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên lớp..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-sm outline-hidden focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
              value={search.name}
              onChange={(e) => setSearch({ ...search, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="relative md:col-span-5">
            <SlidersHorizontal className="absolute top-3.5 left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-4 pl-10 text-sm outline-hidden focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none text-slate-700"
              onChange={(e) => filterByTeacher(e.target.value)}
            >
              <option value="">Tất cả giáo viên phụ trách</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors md:col-span-2"
          >
            Tìm kiếm
          </button>
        </div>

        {/* DATA CONTAINER (RESPONSIVE CHUYỂN ĐỔI GIỮA TABLE LAPTOP VÀ CARD SMARTPHONE) */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-slate-100">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-500">Đang đồng bộ dữ liệu hệ thống...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-2xl bg-white border border-dashed border-slate-200 p-6 text-center">
            <p className="text-base font-semibold text-slate-700">Không tìm thấy dữ liệu</p>
            <p className="text-sm text-slate-400 max-w-xs">Không có lớp học nào khớp với bộ lọc tìm kiếm hiện tại của bạn.</p>
          </div>
        ) : (
          <>
            {/* 1. LAYOUT TABLE (DÀNH CHO LAPTOP/DESKTOP - HIDDEN TRÊN MOBILE) */}
            <div className="hidden md:block overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Tên lớp học</th>
                    <th className="py-4 px-6">Độ tuổi áp dụng</th>
                    <th className="py-4 px-6">Sĩ số tối đa</th>
                    <th className="py-4 px-6">Giáo viên hướng dẫn</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <motion.tbody 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-slate-100 text-sm font-medium text-slate-700"
                >
                  {classes.map((c) => (
                    <motion.tr variants={itemVariants} key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                      <td className="py-4 px-6 text-slate-500">{c.age} tuổi</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <Users className="h-3 w-3" />
                          {c.capacity} học viên
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {c.teacher?.fullName ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                              {c.teacher.fullName.charAt(0)}
                            </div>
                            {c.teacher.fullName}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openView(c.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Chỉnh sửa"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa bỏ"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>

            {/* 2. LAYOUT CARD VỚI IPHONE / SMARTPHONE RESPONSIVE (MD:HIDDEN) */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 md:hidden"
            >
              {classes.map((c) => (
                <motion.div
                  variants={itemVariants}
                  key={c.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between border-b border-slate-50 pb-3 mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">ID lớp học: #{c.id?.toString().slice(-5)}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                      {c.age} tuổi
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-medium text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>Sức chứa: <strong className="text-slate-800">{c.capacity} học sinh</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>Giáo viên: <strong className="text-slate-800">{c.teacher?.fullName || "Chưa gán"}</strong></span>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-50 pt-3">
                    <button onClick={() => openView(c.id)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-50 py-2 text-xs font-semibold text-slate-700 active:bg-slate-100 transition-colors"><Eye className="h-3.5 w-3.5" /> Chi tiết</button>
                    <button onClick={() => openEdit(c)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-amber-50 py-2 text-xs font-semibold text-amber-700 active:bg-amber-100 transition-colors"><Edit2 className="h-3.5 w-3.5" /> Sửa</button>
                    <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-xl bg-red-50 text-red-600 active:bg-red-100 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1.5">
                <button
                  disabled={page === 0}
                  onClick={() => { setPage(page - 1); fetchClasses(page - 1); }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPage(i); fetchClasses(i); }}
                    className={`h-9 w-9 text-xs font-bold rounded-xl transition-all ${
                      page === i 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                        : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={page === totalPages - 1}
                  onClick={() => { setPage(page + 1); fetchClasses(page + 1); }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* MODAL THÊM / SỬA / XEM CHI TIẾT */}
        <AnimatePresence>
          {openModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* BACKDROP */}
              <motion.div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenModal(false)}
              />

              {/* WINDOW */}
              <motion.div
                className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-slate-100 z-10 max-h-[90vh] overflow-y-auto"
                initial={{ y: "100%", opacity: 0.5, scale: 1 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                {/* Thanh kéo nhỏ gọn trên giao diện iPhone */}
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    {mode === "view" && <FileText className="h-5 w-5 text-blue-600" />}
                    {mode === "create" && <Plus className="h-5 w-5 text-green-600" />}
                    {mode === "edit" && <Edit2 className="h-5 w-5 text-amber-600" />}
                    {mode === "view" ? "Thông Tin Chi Tiết" : mode === "create" ? "Thêm Lớp Học Mới" : "Cập Nhật Lớp Học"}
                  </h3>
                  <button 
                    onClick={() => setOpenModal(false)} 
                    className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {mode === "view" ? (
                  <div className="space-y-4 text-sm font-medium text-slate-600">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-0.5">Tên lớp học</span>
                      <span className="text-base font-bold text-slate-900">{selectedClass?.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <span className="text-xs text-slate-400 block mb-0.5">Độ tuổi tiếp nhận</span>
                        <span className="text-slate-800 font-semibold">{selectedClass?.age} tuổi</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <span className="text-xs text-slate-400 block mb-0.5">Sĩ số giới hạn</span>
                        <span className="text-slate-800 font-semibold">{selectedClass?.capacity} học viên</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                        {selectedClass?.teacher?.fullName?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Giáo viên phụ trách</span>
                        <span className="text-slate-900 font-bold">{selectedClass?.teacher?.fullName || "Chưa chỉ định giáo viên"}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <span className="text-xs text-slate-400 block mb-1">Mô tả về lớp học</span>
                      <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{selectedClass?.description || "Không có mô tả chi tiết."}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1.5">Tên lớp học <span className="text-red-500">*</span></label>
                      <input
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                        placeholder="Nhập tên lớp học (Ví dụ: Lớp Chồi 2)"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1.5">Độ tuổi giới hạn</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                          value={form.age}
                          onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1.5">Sĩ số tối đa</label>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                          value={form.capacity}
                          onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1.5">Phân công Giáo viên phụ trách</label>
                      <select
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 bg-white"
                        value={form.teacherId}
                        onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                      >
                        <option value="">Chọn một giáo viên giảng dạy</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.fullName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1.5">Ghi chú / Mô tả ngắn</label>
                      <textarea
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm outline-hidden focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-800 resize-none"
                        placeholder="Thông tin thêm hoặc quy định riêng biệt của lớp học này..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2.5 mt-6 border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => setOpenModal(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Đóng lại
                  </button>
                  {mode !== "view" && (
                    <button
                      onClick={handleSubmit}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/10"
                    >
                      Xác nhận lưu dữ liệu
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL CONFIRM XÓA (THAY THẾ WINDOW.CONFIRM GIAO DIỆN CŨ) */}
        <AnimatePresence>
          {deleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-100 z-10 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                  <Trash2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Xác nhận xóa lớp học này?</h4>
                <p className="text-xs text-slate-400 leading-normal px-2 mb-5">Hành động này sẽ xóa vĩnh viễn lớp học ra khỏi danh sách quản lý. Bạn chắc chắn muốn tiếp tục?</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Hủy lệnh</button>
                  <button onClick={confirmDelete} className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md shadow-red-600/10">Xác nhận xóa</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ClassManagementPage;