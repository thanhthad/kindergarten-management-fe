import React, { useEffect, useState, useMemo, useCallback } from "react";
import { attendanceApi } from "../../../api/attendanceApi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Check,
  X,
  Save,
  Loader2,
  Search,
  ClipboardCheck,
  Calendar,
} from "lucide-react";

/* ================= NOTE INPUT ================= */
const NoteInput = ({ initialValue, onSaveChange }) => {
  const [val, setVal] = useState(initialValue || "");

  useEffect(() => setVal(initialValue || ""), [initialValue]);

  return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => val !== initialValue && onSaveChange(val)}
      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
      className="
        w-full text-xs px-3 py-2
        rounded-xl
        bg-white/60 backdrop-blur-xl
        border border-white/40
        shadow-inner
        focus:outline-none focus:ring-2 focus:ring-indigo-400
        transition
      "
      placeholder="Ghi chú..."
    />
  );
};

/* ================= PAGE ================= */
const AttendancePage = () => {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [attendanceList, setAttendanceList] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= LOAD ================= */
  useEffect(() => {
    let ok = true;

    const load = async () => {
      setLoading(true);
      try {
        const [datesRes, dataRes] = await Promise.all([
          attendanceApi.getDatesByClass(),
          selectedDate === todayStr
            ? attendanceApi.init()
            : attendanceApi.getClassAttendance(selectedDate),
        ]);

        if (!ok) return;

        setAvailableDates(datesRes.data?.data || []);

        const list = (dataRes.data?.data || []).map((x) => ({
          ...x,
          originalStatus: x.status,
          originalNote: x.note,
        }));

        setAttendanceList(list);
        setPendingUpdates([]);
      } catch {
        toast.error("Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => (ok = false);
  }, [selectedDate]);

  /* ================= UPDATE ================= */
  const updateLocal = useCallback((id, fields) => {
    setAttendanceList((prev) => {
      const idx = prev.findIndex((x) => x.id === id || x.studentId === id);
      if (idx === -1) return prev;

      const cur = prev[idx];
      const key = cur.id || cur.studentId;

      const nextStatus =
        fields.status !== undefined ? fields.status : cur.status;
      const nextNote =
        fields.note !== undefined ? fields.note : cur.note || "";

      const dirty =
        nextStatus !== cur.originalStatus ||
        nextNote !== (cur.originalNote || "");

      setPendingUpdates((p) => {
        const i = p.findIndex((x) => x.attendanceId === key);

        if (!dirty) return p.filter((_, idx) => idx !== i);

        const item = {
          attendanceId: key,
          status: nextStatus,
          note: nextNote,
        };

        if (i !== -1) {
          const copy = [...p];
          copy[i] = item;
          return copy;
        }

        return [...p, item];
      });

      const copy = [...prev];
      copy[idx] = { ...cur, ...fields };
      return copy;
    });
  }, []);

  /* ================= SAVE ================= */
  const saveAll = async () => {
    if (!pendingUpdates.length) return;

    setSaving(true);
    try {
      await attendanceApi.batchUpdate(pendingUpdates);

      toast.success("Đã lưu 🎉");

      setAttendanceList((prev) =>
        prev.map((x) => ({
          ...x,
          originalStatus: x.status,
          originalNote: x.note,
        }))
      );

      setPendingUpdates([]);
    } catch {
      toast.error("Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    const k = searchTerm.toLowerCase();
    return attendanceList.filter(
      (x) =>
        x.studentName?.toLowerCase().includes(k) ||
        String(x.studentId).includes(k)
    );
  }, [attendanceList, searchTerm]);

  /* ================= ANIMATION ================= */
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="text-indigo-600" />
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            Attendance System
          </h1>
        </div>

        <div className="flex gap-2 flex-col md:flex-row">
          {/* search */}
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-white/40 px-3 py-2 rounded-xl shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input
              className="outline-none text-sm bg-transparent"
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* date */}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/70 border border-white/40 rounded-xl px-3 py-2 text-sm shadow-sm"
          >
            <option value={todayStr}>Today</option>
            {availableDates.map((d, i) => (
              <option key={i} value={d.attendanceDate}>
                {d.attendanceDate}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" />
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence>
            {filtered.map((s) => {
              const id = s.id || s.studentId;

              return (
                <motion.div
                  key={id}
                  variants={item}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="
                    flex flex-col md:flex-row md:items-center gap-3
                    bg-white/60 backdrop-blur-xl
                    border border-white/40
                    rounded-2xl p-4
                    shadow-[0_10px_30px_rgba(0,0,0,0.05)]
                  "
                >
                  {/* name */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">
                      {s.studentName}
                    </p>
                    <p className="text-xs text-slate-400">
                      ID: {s.studentId}
                    </p>
                  </div>

                  {/* buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        updateLocal(id, { status: "PRESENT" })
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        s.status === "PRESENT"
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-white/60"
                      }`}
                    >
                      <Check size={14} />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        updateLocal(id, { status: "ABSENT" })
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        s.status === "ABSENT"
                          ? "bg-rose-500 text-white shadow-md"
                          : "bg-white/60"
                      }`}
                    >
                      <X size={14} />
                    </motion.button>
                  </div>

                  {/* note */}
                  <div className="md:w-56">
                    <NoteInput
                      initialValue={s.note}
                      onSaveChange={(v) =>
                        updateLocal(id, { note: v })
                      }
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* FLOAT SAVE */}
      <AnimatePresence>
        {pendingUpdates.length > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveAll}
            disabled={saving}
            className="
              fixed bottom-6 right-6
              bg-indigo-600 text-white
              px-5 py-3 rounded-2xl
              shadow-[0_10px_30px_rgba(79,70,229,0.4)]
              flex items-center gap-2
            "
          >
            {saving ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu ({pendingUpdates.length})
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendancePage;