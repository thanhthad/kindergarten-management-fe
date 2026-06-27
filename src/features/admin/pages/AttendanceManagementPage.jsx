import React, { useEffect, useState } from "react";
import { attendanceApi } from "../../../api/attendanceApi";
import { classApi } from "../../../api/classApi";
import { userApi } from "../../../api/userApi";
import toast from "react-hot-toast";
import {
  Calendar,
  Users,
  BarChart3,
  Trash2,
  RefreshCcw,
  Filter,
} from "lucide-react";

const AttendanceManagementPage = () => {
  // ================= CORE STATE =================
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= DATA =================
  const [dates, setDates] = useState([]);

  const [attendanceDetail, setAttendanceDetail] = useState([]);
  const [summaryByDate, setSummaryByDate] = useState([]);
  const [summaryByClass, setSummaryByClass] = useState([]);
  const [rateByClass, setRateByClass] = useState([]);
  const [teacherSummary, setTeacherSummary] = useState([]);

  const [studentsNotYet, setStudentsNotYet] = useState([]);
  const [topAbsent, setTopAbsent] = useState([]);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filteredData, setFilteredData] = useState([]);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classHistory, setClassHistory] = useState([]);

  const [teacherId, setTeacherId] = useState(null);

  // ================= INIT =================
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // ================= LOAD CLASSES =================
  useEffect(() => {
    classApi
      .getAll({ page: 0, size: 100 })
      .then((res) => setClasses(res.data.data.content || []))
      .catch(() => toast.error("Load classes failed"));
  }, []);

  // ================= LOAD ALL (MASTER FUNCTION) =================
  const loadAll = async (d = date) => {
    if (!d) return;

    setLoading(true);
    try {
      const [
        detail,
        summaryDate,
        rate,
        notYet,
        top,
        datesRes,
      ] = await Promise.all([
        attendanceApi.getByDate(d),
        attendanceApi.getSummaryByDate(d),
        attendanceApi.getRate(d),
        attendanceApi.getStudentsNotYet(d),
        attendanceApi.getTopAbsent(),
        attendanceApi.getAllDates(),
      ]);

      setAttendanceDetail(detail.data.data?.content || []);
      setSummaryByDate(summaryDate.data.data || []);
      setRateByClass(rate.data.data || []);
      setStudentsNotYet(notYet.data.data?.content || []);
      setTopAbsent(top.data.data || []);
      setDates(datesRes.data.data || []);

      applyFilter(detail.data.data?.content || [], filterStatus);
    } catch (e) {
      toast.error("Load failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= TEACHER SUMMARY =================
  const loadTeacherSummary = async (id) => {
    if (!id || !date) return;

    try {
      const res = await attendanceApi.getTeacherSummary(id, date);
      setTeacherSummary(res.data.data || []);
    } catch {
      toast.error("Teacher summary failed");
    }
  };

  // ================= CLASS SUMMARY =================
  const loadClassSummary = async (classId) => {
    if (!classId || !date) return;

    try {
      const res = await attendanceApi.getSummaryByClass(classId, date);
      setSummaryByClass(res.data.data || []);
    } catch {
      toast.error("Class summary failed");
    }
  };

  // ================= CLASS HISTORY =================
  const loadClassHistory = async (classId) => {
    try {
      const res = await attendanceApi.getClassHistory(
        classId,
        date,
        date,
        { page: 0, size: 20 }
      );
      setClassHistory(res.data.data?.content || []);
    } catch {
      toast.error("Class history failed");
    }
  };

  // ================= FILTER =================
  const applyFilter = (data, status) => {
    if (status === "ALL") {
      setFilteredData(data);
      return;
    }
    setFilteredData(data.filter((x) => x.status === status));
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete attendance?")) return;

    try {
      await attendanceApi.delete(id);
      toast.success("Deleted");
      loadAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= UI =================
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users /> Attendance Dashboard
        </h1>

        <button
          onClick={() => loadAll()}
          className="flex gap-2 items-center bg-blue-600 text-white px-3 py-2 rounded"
        >
          <RefreshCcw size={16} /> Reload
        </button>
      </div>

      {/* DATE */}
      <div className="flex gap-3 items-center">
        <Calendar />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={() => loadAll(date)}
          className="bg-green-600 text-white px-3 py-2 rounded"
        >
          Load
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 items-center">
        <Filter />
        <select
          className="border p-2"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            applyFilter(attendanceDetail, e.target.value);
          }}
        >
          <option value="ALL">ALL</option>
          <option value="PRESENT">PRESENT</option>
          <option value="ABSENT">ABSENT</option>
        </select>
      </div>

      {/* SUMMARY BY DATE */}
      <div className="grid grid-cols-3 gap-4">
        {summaryByDate.map((s, i) => (
          <div key={i} className="bg-gray-100 p-3 rounded">
            <p className="font-bold">{s.status}</p>
            <p>{s.total}</p>
          </div>
        ))}
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="bg-white shadow p-4 rounded">
        <h2 className="font-bold mb-3">Attendance Detail</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th>Student</th>
              <th>Class</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((a, i) => (
              <tr key={i} className="border-t">
                <td>{a.studentName}</td>
                <td>{a.className}</td>
                <td>{a.status}</td>
                <td>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CLASS SELECT */}
      <select
        className="border p-2"
        onChange={(e) => {
          const id = e.target.value;
          setSelectedClass(id);
          loadClassSummary(id);
          loadClassHistory(id);
        }}
      >
        <option value="">Select Class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* CLASS SUMMARY */}
      {summaryByClass.length > 0 && (
        <div className="bg-gray-100 p-3 rounded">
          <h2 className="font-bold">Class Summary</h2>
          {summaryByClass.map((s, i) => (
            <p key={i}>{s.status}: {s.total}</p>
          ))}
        </div>
      )}

      {/* RATE */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-bold flex items-center gap-2">
          <BarChart3 /> Attendance Rate
        </h2>
        {rateByClass.map((r, i) => (
          <p key={i}>
            {r.className} - {r.rate}%
          </p>
        ))}
      </div>

      {/* NOT YET */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-bold">Not Yet Attendance</h2>
        {studentsNotYet.map((s) => (
          <p key={s.id}>{s.fullName}</p>
        ))}
      </div>

      {/* TOP ABSENT */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-bold">Top Absent</h2>
        {topAbsent.map((t) => (
          <p key={t.studentId}>
            {t.studentName} - {t.absentDays}
          </p>
        ))}
      </div>

      {/* TEACHER SUMMARY */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="font-bold">Teacher Summary</h2>
        {teacherSummary.map((t, i) => (
          <p key={i}>
            {t.className} | P: {t.present} | A: {t.absent}
          </p>
        ))}
      </div>

      {/* CLASS HISTORY */}
      {classHistory.length > 0 && (
        <div className="bg-white p-4 shadow rounded">
          <h2 className="font-bold">Class History</h2>
          {classHistory.map((h, i) => (
            <p key={i}>
              {h.studentName} - {h.attendanceDate} - {h.status}
            </p>
          ))}
        </div>
      )}

    </div>
  );
};

export default AttendanceManagementPage;