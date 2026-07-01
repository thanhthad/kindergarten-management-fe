import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Clock, Save, Timer, Moon, Sun } from "lucide-react";
import { attendanceSettingApi } from "../../../api/attendanceSettingApi";

/* ================= PAGE ================= */
const AttendanceSettingPage = () => {
  const [form, setForm] = useState({
    startTime: "",
    endTime: "",
    allowLateMinutes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await attendanceSettingApi.get?.(); // nếu bạn chưa có API get
        const data = res?.data?.data;

        if (data) {
          setForm({
            startTime: data.startTime || "",
            endTime: data.endTime || "",
            allowLateMinutes: data.allowLateMinutes || 0,
          });
        }
      } catch {
        toast.error("Không tải được setting");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  /* ================= UPDATE ================= */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      toast.error("Start time phải nhỏ hơn End time");
      return;
    }

    setSaving(true);
    try {
      await attendanceSettingApi.update(form);
      toast.success("Cập nhật thành công 🎉");
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Clock className="text-indigo-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-10 bg-gradient-to-br from-indigo-50 via-white to-slate-100">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Timer className="text-indigo-600" />
          Attendance Setting
        </h1>
        <p className="text-sm text-slate-500">
          Quản lý thời gian điểm danh của hệ thống
        </p>
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          max-w-2xl
          bg-white/60 backdrop-blur-xl
          border border-white/40
          shadow-[0_10px_40px_rgba(0,0,0,0.05)]
          rounded-3xl
          p-6 md:p-8
        "
      >

        {/* START TIME */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <Sun size={16} className="text-indigo-500" />
            Giờ bắt đầu
          </label>

          <input
            type="time"
            value={form.startTime}
            onChange={(e) => handleChange("startTime", e.target.value)}
            className="
              w-full px-4 py-3 rounded-2xl
              bg-white/70 backdrop-blur
              border border-white/40
              shadow-inner
              focus:outline-none focus:ring-2 focus:ring-indigo-400
            "
          />
        </div>

        {/* END TIME */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <Moon size={16} className="text-indigo-500" />
            Giờ kết thúc
          </label>

          <input
            type="time"
            value={form.endTime}
            onChange={(e) => handleChange("endTime", e.target.value)}
            className="
              w-full px-4 py-3 rounded-2xl
              bg-white/70 backdrop-blur
              border border-white/40
              shadow-inner
              focus:outline-none focus:ring-2 focus:ring-indigo-400
            "
          />
        </div>

        {/* LATE MINUTES */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
            <Clock size={16} className="text-indigo-500" />
            Số phút cho phép đi muộn
          </label>

          <input
            type="number"
            min={0}
            value={form.allowLateMinutes}
            onChange={(e) =>
              handleChange("allowLateMinutes", Number(e.target.value))
            }
            className="
              w-full px-4 py-3 rounded-2xl
              bg-white/70 backdrop-blur
              border border-white/40
              shadow-inner
              focus:outline-none focus:ring-2 focus:ring-indigo-400
            "
          />
        </div>

        {/* PREVIEW CARD */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-slate-50 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Preview</p>
          <p className="text-sm font-semibold text-slate-700">
            {form.startTime || "--:--"} → {form.endTime || "--:--"}
          </p>
          <p className="text-xs text-slate-500">
            Late allowance: {form.allowLateMinutes} minutes
          </p>
        </div>

        {/* SAVE BUTTON */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="
            w-full
            flex items-center justify-center gap-2
            bg-indigo-600 hover:bg-indigo-700
            text-white font-bold
            py-3 rounded-2xl
            shadow-[0_10px_30px_rgba(79,70,229,0.4)]
            transition
          "
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Clock size={16} />
              </motion.div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save size={16} />
              Lưu cấu hình
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AttendanceSettingPage;