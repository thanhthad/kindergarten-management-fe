import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // Ép modal nhảy ra khỏi layout cha
import { studentApi } from "../../../api/studentApi";
import toast from "react-hot-toast";
import { Edit2, RefreshCw, GraduationCap, MapPin, Mail, Phone, User, X, Calendar } from "lucide-react";

const initialForm = {
  classId: "",
  fullName: "",
  gender: "",
  dateOfBirth: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  address: "",
};

// ================= HÀM HỖ TRỢ HIỂN THỊ VIỆT HÓA =================
const displayGender = (gender) => {
  if (!gender) return "Chưa cập nhật";
  const g = gender.toLowerCase();
  if (g === "male") return "Nam";
  if (g === "female") return "Nữ";
  return gender;
};

const displayStatus = (status) => {
  if (!status) return "Chưa rõ";
  const s = status.toLowerCase();
  switch (s) {
    case "active": return "Đang học";
    case "inactive": return "Nghỉ học";
    case "graduated": return "Đã tốt nghiệp";
    default: return status;
  }
};

const buildPayload = (data) => {
  const payload = { ...data };
  if (payload.gender === "Nam") payload.gender = "male";
  if (payload.gender === "Nữ") payload.gender = "female";
  return payload;
};

// ================= POPUP FORM CHỈNH SỬA (CHUYỂN SANG DÙNG PORTAL CHUẨN ĐẸP) =================
const EditStudentModal = ({ isOpen, onClose, studentData, onSave }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentData) {
      setForm({
        classId: studentData.classId || "",
        fullName: studentData.fullName || "",
        gender: studentData.gender?.toLowerCase() === "male" ? "Nam" : studentData.gender?.toLowerCase() === "female" ? "Nữ" : "",
        dateOfBirth: studentData.dateOfBirth || "",
        parentName: studentData.parentName || "",
        parentPhone: studentData.parentPhone || "",
        parentEmail: studentData.parentEmail || "",
        address: studentData.address || "",
      });
    }
  }, [studentData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = buildPayload(form);
      await studentApi.update(studentData.id, payload);
      toast.success("Cập nhật thông tin học sinh thành công");
      onSave();
      onClose();
    } catch (err) {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Dùng createPortal để render thẳng vào body, bỏ qua mọi giới hạn CSS của layout cha
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen w-screen left-0 top-0">
      
      {/* Lớp nền đen mờ bao phủ toàn bộ trình duyệt */}
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-md transition-opacity w-full h-full left-0 top-0" 
        onClick={onClose}
      ></div>
      
      {/* Khung Form thiết kế hiện đại, bo góc tròn */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-10 border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Edit2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Chỉnh sửa Hồ sơ Học sinh</h2>
              <p className="text-xs text-slate-500">Mã học sinh: #{studentData?.id}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* Form Body (Có thanh cuộn mượt khi màn hình nhỏ) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-left">
          
          {/* Section: Thông tin học sinh */}
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Thông tin học sinh</p>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Họ và Tên</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={16} />
                </div>
                <input required name="fullName" value={form.fullName} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" placeholder="Nguyễn Văn A" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mã lớp</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <GraduationCap size={16} />
                  </div>
                  <input required name="classId" value={form.classId} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="10A1" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Giới tính</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white">
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày sinh</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Địa chỉ thường trú</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <MapPin size={16} />
                </div>
                <input name="address" value={form.address} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Số 123, Đường X, Quận Y..." />
              </div>
            </div>
          </div>

          {/* Section: Thông tin phụ huynh (Bọc trong card nhỏ tinh tế) */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Thông tin Phụ huynh / Người giám hộ</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên người giám hộ</label>
                <div className="relative rounded-lg bg-white shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={14} />
                  </div>
                  <input name="parentName" placeholder="Họ và tên cha/mẹ" value={form.parentName} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Số điện thoại liên hệ</label>
                  <div className="relative rounded-lg bg-white shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone size={14} />
                    </div>
                    <input name="parentPhone" placeholder="090xxxxxxx" value={form.parentPhone} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Địa chỉ Email</label>
                  <div className="relative rounded-lg bg-white shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail size={14} />
                    </div>
                    <input type="email" name="parentEmail" placeholder="phuhuynh@email.com" value={form.parentEmail} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer nút điều hướng cố định */}
          <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm">
              Hủy bỏ
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
              {loading && <RefreshCw size={14} className="animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Chỉ định gắn trực tiếp thẻ html này vào body tổng của web
  );
};

// ================= GIAO DIỆN TRANG CHÍNH =================
const TeacherStudentPage = () => {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadStudents = async () => {
    try {
      const res = await studentApi.getMyClass();
      setStudents(res.data?.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách học sinh");
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800">
      {/* Header tiêu đề */}
      <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="rounded-xl bg-blue-600 p-2 text-white shadow-md shadow-blue-100">
          <GraduationCap size={24} className="md:w-7 md:h-7" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Danh sách Học sinh</h1>
          <p className="text-xs md:text-sm text-slate-500">Quản lý và cập nhật thông tin hồ sơ lớp học</p>
        </div>
      </div>

      {/* DANH SÁCH HIỂN THỊ CHIẾM TOÀN BỘ CHIỀU RỘNG MÀN HÌNH */}
      <div className="w-full rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-base md:text-lg font-semibold text-slate-900">Sĩ số lớp ({students.length})</h3>
          <button onClick={loadStudents} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition" title="Tải lại danh sách">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* --- VIEW MOBILE/TABLET (CARD LAYOUT) --- */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {students.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">Không tìm thấy dữ liệu học sinh nào.</div>
          ) : (
            students.map((s) => (
              <div key={s.id} className="p-4 hover:bg-slate-50/50 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-mono text-slate-400 mr-2">#{s.id}</span>
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded">Lớp {s.className || s.classId || "—"}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : s.status?.toLowerCase() === 'graduated' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {displayStatus(s.status)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">{s.fullName}</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-500 mb-3">
                  <div>Giới tính: <span className="text-slate-800 font-medium">{displayGender(s.gender)}</span></div>
                  <div>Ngày sinh: <span className="text-slate-800 font-medium">{s.dateOfBirth || "Chưa rõ"}</span></div>
                </div>
                
                {(s.parentName || s.parentPhone || s.parentEmail || s.address) && (
                  <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 text-xs text-slate-600 mb-3">
                    {s.parentName && <div className="flex items-center gap-1.5"><User size={13} className="text-slate-400" /><b>PH:</b> {s.parentName}</div>}
                    {s.parentPhone && <div className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" />{s.parentPhone}</div>}
                    {s.parentEmail && <div className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" />{s.parentEmail}</div>}
                    {s.address && <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60"><MapPin size={13} className="text-slate-400" />{s.address}</div>}
                  </div>
                )}
                
                <button onClick={() => openEditModal(s)} className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 active:bg-slate-100 transition">
                  <Edit2 size={14} /> Chỉnh sửa hồ sơ
                </button>
              </div>
            ))
          )}
        </div>

        {/* --- VIEW PC (TABLE LAYOUT) --- */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <th className="py-3 px-5">Mã số</th>
                <th className="py-3 px-5">Lớp</th>
                <th className="py-3 px-5">Thông tin Học sinh</th>
                <th className="py-3 px-5">Thông tin Phụ huynh</th>
                <th className="py-3 px-5">Địa chỉ thường trú</th>
                <th className="py-3 px-5">Trạng thái</th>
                <th className="py-3 px-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr><td colSpan="7" className="py-10 text-center text-slate-400">Không tìm thấy dữ liệu học sinh nào.</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-mono text-xs text-slate-400">#{s.id}</td>
                    <td className="py-4 px-5 font-semibold text-slate-700">{s.className || s.classId || "—"}</td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 text-sm">{s.fullName}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex gap-2"><span>{displayGender(s.gender)}</span> • <span>{s.dateOfBirth || "—"}</span></div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-slate-800 font-semibold text-xs">{s.parentName || "—"}</div>
                      {s.parentPhone && <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><Phone size={11}/>{s.parentPhone}</div>}
                      {s.parentEmail && <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]" title={s.parentEmail}>{s.parentEmail}</div>}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-600 max-w-[200px] truncate" title={s.address}>{s.address || "—"}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : s.status?.toLowerCase() === 'graduated' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : s.status?.toLowerCase() === 'graduated' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                        {displayStatus(s.status)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button onClick={() => openEditModal(s)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 shadow-sm">
                        <Edit2 size={12} /> Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP FORM */}
      <EditStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        studentData={selectedStudent} 
        onSave={loadStudents} 
      />
    </div>
  );
};

export default TeacherStudentPage;