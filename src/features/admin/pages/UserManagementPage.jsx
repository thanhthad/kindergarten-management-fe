import React, { useState, useEffect, useCallback } from "react";
import { Table, Select, Form } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    Trash2, 
    Eye, 
    Plus, 
    RefreshCw, 
    User, 
    Mail, 
    Phone, 
    Fingerprint, 
    X,
    Users,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { userApi } from "../../../api/userApi";

const { Option } = Select;

// Biến cấu hình hiệu ứng mượt mà chuẩn iOS
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        transition: { type: "spring", damping: 25, stiffness: 350 } 
    },
    exit: { opacity: 0, scale: 0.95, y: 15, transition: { duration: 0.2, ease: "easeIn" } }
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 22, stiffness: 260 } }
};

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [searchType, setSearchType] = useState("fullName");
    const [searchText, setSearchText] = useState("");

    // ===== DETAIL MODAL STATE =====
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // ===== CREATE MODAL STATE =====
    const [createOpen, setCreateOpen] = useState(false);
    const [form] = Form.useForm();

    // ===== CUSTOM DELETE MODAL STATE =====
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);

    // ================= FETCH USERS =================
    const fetchUsers = useCallback(
        async (page = 1, size = 10, type = searchType, keyword = "") => {
            setLoading(true);
            try {
                const params = { page: page - 1, size };
                let response;

                if (!keyword) {
                    response = await userApi.getAll(params);
                } else {
                    if (type === "fullName") {
                        response = await userApi.searchByFullName(keyword, params);
                    } else if (type === "phone") {
                        response = await userApi.searchByPhone(keyword, params);
                    } else if (type === "email") {
                        response = await userApi.getByEmail(keyword);
                    }
                }

                const data = response.data.data;

                if (type === "email" && data) {
                    setUsers([data]);
                    setPagination((prev) => ({
                        ...prev,
                        current: 1,
                        total: 1,
                    }));
                } else if (data && data.content) {
                    const { content, totalElements } = data;
                    setUsers(content);
                    setPagination((prev) => ({
                        ...prev,
                        current: page,
                        total: totalElements,
                    }));
                }
            } catch (error) {
                toast.error("Lỗi tải dữ liệu người dùng!", {
                    style: { borderRadius: '14px', background: '#fff', color: '#1e293b' }
                });
            } finally {
                setLoading(false);
            }
        },
        [searchType]
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ================= DELETE XỬ LÝ =================
    const openDeleteConfirm = (id) => {
        setUserIdToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!userIdToDelete) return;
        const loadingToast = toast.loading("Đang xử lý xóa tài khoản...");
        setDeleteModalOpen(false);
        try {
            await userApi.deleteUser(userIdToDelete);
            toast.success("Xóa tài khoản thành công!", { id: loadingToast, style: { borderRadius: '14px' } });
            fetchUsers(pagination.current, pagination.pageSize, searchType, searchText);
        } catch (error) {
            toast.error("Xóa tài khoản thất bại!", { id: loadingToast, style: { borderRadius: '14px' } });
        } finally {
            setUserIdToDelete(null);
        }
    };

    // ================= VIEW DETAIL =================
    const handleView = async (id) => {
        try {
            const res = await userApi.getById(id);
            setSelectedUser(res.data.data);
            setDetailOpen(true);
        } catch {
            toast.error("Không lấy được dữ liệu chi tiết!", { style: { borderRadius: '14px' } });
        }
    };

    // ================= CREATE =================
    const handleCreate = async () => {
    try {
        const values = await form.validateFields();

        const loadingToast = toast.loading("Đang tạo tài khoản...");

        const res = await userApi.createUser(values);

        // ================= SUCCESS =================
        if (res.success) {
            toast.success(res.message, { id: loadingToast });

            setCreateOpen(false);
            form.resetFields();
            fetchUsers();
        }

        // ================= FAIL FROM BACKEND =================
        else {
            toast.error(res.message, { id: loadingToast });

            // 👉 MAP FIELD ERROR TỪ BACKEND
            if (res.data) {
                Object.keys(res.data).forEach((field) => {
                    form.setFields([
                        {
                            name: field,
                            errors: [res.data[field]],
                        },
                    ]);
                });
            }
        }

    } catch (error) {
        if (!error.errorFields) {
            toast.error("Tạo tài khoản thất bại!");
        }
    }
};

    // ================= COLUMNS (Desktop Only Table) =================
    const columns = [
        { 
            title: "ID", 
            dataIndex: "id", 
            key: "id",
            render: (text) => <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{text}</span>
        },
        { 
            title: "Họ tên", 
            dataIndex: "fullName", 
            key: "fullName",
            render: (text) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {text?.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-800">{text}</span>
                </div>
            )
        },
        { title: "Email", dataIndex: "email", key: "email", render: (t) => <span className="text-slate-600 font-medium">{t}</span> },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone", render: (t) => <span className="text-slate-600 font-medium">{t || "---"}</span> },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_, record) => (
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                        onClick={() => handleView(record.id)}
                    >
                        <Eye size={16} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                        onClick={() => openDeleteConfirm(record.id)}
                    >
                        <Trash2 size={16} />
                    </motion.button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/60 pb-12">
            {/* Cấu hình Toast Toaster cao cấp */}
            <Toaster 
                position="top-center" 
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: '#ffffff',
                        color: '#0f172a',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        borderRadius: '16px',
                        padding: '12px 20px',
                        border: '1px solid #f1f5f9',
                        fontSize: '14px',
                        fontWeight: '500'
                    }
                }} 
            />

            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 md:p-8 max-w-6xl mx-auto"
            >
                {/* HEADER */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-4">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl shadow-xl shadow-indigo-500/10">
                            <Users size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight m-0">Thành viên hệ thống</h1>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium">Quản lý tài khoản, tìm kiếm dữ liệu thời gian thực</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 h-12 rounded-xl shadow-md active:scale-95 transition-all w-full sm:w-auto"
                        onClick={() => setCreateOpen(true)}
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Thêm tài khoản
                    </motion.button>
                </motion.div>

                {/* FILTERS & SEARCH TOOLBAR */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-2.5 mb-6"
                >
                    <div className="w-full md:w-44">
                        <Select
                            value={searchType}
                            onChange={setSearchType}
                            className="w-full h-11 custom-select-premium"
                            popupClassName="rounded-xl overflow-hidden shadow-xl border border-slate-100"
                        >
                            <Option value="fullName">Tìm theo Tên</Option>
                            <Option value="phone">Tìm theo SĐT</Option>
                            <Option value="email">Tìm theo Email</Option>
                        </Select>
                    </div>

                    <div className="relative flex-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Nhập từ khóa tìm kiếm..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    fetchUsers(1, 10, searchType, searchText);
                                }
                            }}
                            className="w-full h-11 pl-11 pr-4 bg-slate-50 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm font-medium transition-all text-slate-800 placeholder-slate-400"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => fetchUsers(1, 10, searchType, searchText)}
                            className="flex-1 md:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 rounded-xl text-sm transition-all h-11 shadow-sm shadow-indigo-600/10"
                        >
                            Tìm kiếm
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ rotate: 180, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            onClick={() => {
                                setSearchText("");
                                fetchUsers();
                            }}
                            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors h-11"
                        >
                            <RefreshCw size={18} />
                        </motion.button>
                    </div>
                </motion.div>

                {/* DATA CONTAINER (DESKTOP vs IPHONE MOBILE) */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table
                            rowKey="id"
                            columns={columns}
                            dataSource={users}
                            loading={loading}
                            pagination={{
                                ...pagination,
                                onChange: (page, size) => {
                                    fetchUsers(page, size, searchType, searchText);
                                },
                            }}
                        />
                    </div>

                    {/* iPhone Mobile Smooth Card Layout */}
                    <div className="block md:hidden p-4 space-y-3.5 bg-slate-50/40">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                <RefreshCw size={24} className="animate-spin text-indigo-500" />
                                <span className="text-xs font-medium">Đang đồng bộ dữ liệu...</span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 font-medium text-sm bg-white rounded-2xl border border-slate-100">
                                Không có dữ liệu người dùng trùng khớp
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-white rounded-2xl border border-slate-100/80 shadow-sm relative active:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                                                    {user.fullName?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm tracking-tight">{user.fullName}</h4>
                                                    <span className="text-[10px] font-mono bg-slate-100 font-bold text-slate-500 px-2 py-0.5 rounded-md mt-1 inline-block">ID: {user.id}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button 
                                                    onClick={() => handleView(user.id)}
                                                    className="p-2 bg-slate-50 active:scale-90 rounded-xl text-indigo-600 transition-all border border-slate-100"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteConfirm(user.id)}
                                                    className="p-2 bg-rose-50 active:scale-90 rounded-xl text-rose-500 transition-all border border-rose-100/50"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-xs font-medium text-slate-600 mt-4 pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-2.5 text-slate-500"><Mail size={13} className="text-slate-400"/> {user.email}</div>
                                            <div className="flex items-center gap-2.5 text-slate-500"><Phone size={13} className="text-slate-400"/> {user.phone || "Chưa cập nhật SĐT"}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                        
                        {/* iPhone UI Soft Pagination */}
                        {pagination.total > pagination.pageSize && (
                            <div className="flex justify-between items-center pt-3 text-sm">
                                <button 
                                    disabled={pagination.current === 1}
                                    onClick={() => fetchUsers(pagination.current - 1, pagination.pageSize, searchType, searchText)}
                                    className="px-3.5 py-2 bg-white border border-slate-200 shadow-sm rounded-xl disabled:opacity-40 text-xs font-bold text-slate-700 active:scale-95 transition-all"
                                >
                                    Trước
                                </button>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">Trang {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}</span>
                                <button 
                                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                                    onClick={() => fetchUsers(pagination.current + 1, pagination.pageSize, searchType, searchText)}
                                    className="px-3.5 py-2 bg-white border border-slate-200 shadow-sm rounded-xl disabled:opacity-40 text-xs font-bold text-slate-700 active:scale-95 transition-all"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* === ĐÃ THAY THẾ TOÀN BỘ MODAL ANTD BẰNG ANIMATEPRESENCE + FRAMER MOTION === */}
            <AnimatePresence>
                {/* 1. VIEW DETAIL MODAL */}
                {detailOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
                            onClick={() => setDetailOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                            className="bg-white w-full sm:max-w-md rounded-t-[24px] sm:rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-5 flex items-center justify-between border-b border-slate-100">
                                <div className="text-sm font-bold text-slate-900 tracking-tight">Hồ sơ chi tiết</div>
                                <button onClick={() => setDetailOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><X size={16}/></button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
                                        {selectedUser.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base m-0 leading-tight">{selectedUser.fullName}</h3>
                                        <p className="text-xs text-indigo-600 font-mono font-bold mt-1.5 m-0">UID: {selectedUser.id}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3.5 text-xs font-medium">
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50">
                                        <span className="text-slate-400 flex items-center gap-2"><Mail size={14}/> Email</span>
                                        <span className="font-bold text-slate-800 break-all pl-4 text-right">{selectedUser.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50">
                                        <span className="text-slate-400 flex items-center gap-2"><Phone size={14}/> Điện thoại</span>
                                        <span className="font-bold text-slate-800">{selectedUser.phone || "Chưa thiết lập"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-slate-400 flex items-center gap-2"><User size={14}/> Trạng thái</span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Đang hoạt động</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setDetailOpen(false)}
                                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95"
                                >
                                    Hoàn tất xem
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 2. CREATE USER MODAL */}
                {createOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
                            onClick={() => setCreateOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                            className="bg-white w-full sm:max-w-md rounded-t-[24px] sm:rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden"
                        >
                            <div className="p-5 flex items-center justify-between border-b border-slate-100">
                                <div className="text-sm font-bold text-slate-900 tracking-tight">Khởi tạo thành viên mới</div>
                                <button onClick={() => setCreateOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><X size={16}/></button>
                            </div>
                            <div className="p-5 max-h-[75vh] overflow-y-auto">
                                <Form form={form} layout="vertical" className="space-y-3">
                                    <Form.Item
                                        name="fullName"
                                        label={<span className="text-[11px] font-bold text-slate-500 tracking-wider">HỌ VÀ TÊN THÀNH VIÊN</span>}
                                        rules={[{ required: true, message: "Trường này không được để trống" }]}
                                        className="mb-0"
                                    >
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400"><User size={15}/></span>
                                            <input placeholder="VD: Nguyễn Văn A" className="w-full h-10.5 pl-10 pr-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all"/>
                                        </div>
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label={<span className="text-[11px] font-bold text-slate-500 tracking-wider">ĐỊA CHỈ EMAIL</span>}
                                        rules={[{ required: true, type: "email", message: "Định dạng email chưa chính xác" }]}
                                        className="mb-0"
                                    >
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400"><Mail size={15}/></span>
                                            <input placeholder="example@domain.com" className="w-full h-10.5 pl-10 pr-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all" type="email"/>
                                        </div>
                                    </Form.Item>

                                    <Form.Item 
                                        name="phone" 
                                        label={<span className="text-[11px] font-bold text-slate-500 tracking-wider">SỐ ĐIỆN THOẠI (TÙY CHỌN)</span>}
                                        className="mb-0"
                                    >
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400"><Phone size={15}/></span>
                                            <input placeholder="Nhập số điện thoại" className="w-full h-10.5 pl-10 pr-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all" type="tel"/>
                                        </div>
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        label={<span className="text-[11px] font-bold text-slate-500 tracking-wider">MẬT KHẨU KHỞI TẠO</span>}
                                        rules={[{ required: true, message: "Vui lòng đặt mật khẩu bảo mật" }]}
                                        className="mb-0"
                                    >
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400"><Fingerprint size={15}/></span>
                                            <input placeholder="••••••••" className="w-full h-10.5 pl-10 pr-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white transition-all" type="password"/>
                                        </div>
                                    </Form.Item>
                                </Form>

                                <div className="flex gap-2.5 mt-6 border-t border-slate-100 pt-4">
                                    <button 
                                        onClick={() => setCreateOpen(false)}
                                        className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        onClick={handleCreate}
                                        className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 active:scale-95"
                                    >
                                        Xác nhận tạo
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 3. PREMIUM DELETE CONFIRMATION MODAL (POP UP XÓA ĐỘC QUYỀN) */}
                {deleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
                            onClick={() => setDeleteModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                            className="bg-white w-full sm:max-w-sm rounded-t-[24px] sm:rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden"
                        >
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
                                    <ShieldAlert size={24} />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 tracking-tight m-0">Xác nhận xóa tài khoản?</h3>
                                <p className="text-xs text-slate-500 font-medium mt-2 max-w-[260px] leading-relaxed">
                                    Hành động này sẽ xóa vĩnh viễn dữ liệu người dùng khỏi máy chủ và không thể khôi phục lại.
                                </p>
                                
                                <div className="flex gap-2 w-full mt-6">
                                    <button 
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
                                    >
                                        Giữ lại
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/10 active:scale-95"
                                    >
                                        Xóa vĩnh viễn
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagementPage;