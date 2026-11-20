import { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import useCollection from "../hooks/useCollection";
import { addActivityToBatch } from "../utils/db";
import { byRoll, CLASSES, MADRASA_NAME, today } from "../utils/helpers";
import {
  btnGreen,
  btnGhost,
  Card,
  DataTable,
  ErrorNote,
  Field,
  inputCls,
  Pill,
  td,
} from "../components/ui";

const STATUSES = [
  { key: "present", label: "Present", on: "bg-emerald-600 text-white", off: "text-emerald-700 hover:bg-emerald-50" },
  { key: "absent", label: "Absent", on: "bg-red-600 text-white", off: "text-red-600 hover:bg-red-50" },
  { key: "holiday", label: "Holiday", on: "bg-violet-600 text-white", off: "text-violet-700 hover:bg-violet-50" },
  { key: "leave", label: "Leave", on: "bg-amber-500 text-white", off: "text-amber-600 hover:bg-amber-50" },
];

export default function Attendance() {
  const students = useCollection("students");
  const attendance = useCollection("attendance");

  const [cls, setCls] = useState(CLASSES[0]);
  const [reportScope, setReportScope] = useState("current");
  const [date, setDate] = useState(today());
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);

  const list = useMemo(
    () => students.data.filter((s) => s.class === cls).sort(byRoll),
    [students.data, cls]
  );

  const docId = `${cls}_${date}`;
  const existing = attendance.data.find((r) => r.id === docId);

  // Load the saved attendance for this class + date
  useEffect(() => {
    setMarks(existing?.records || {});
  }, [docId, existing]);

  const statusOf = (id) => marks[id] || "present";
  const setStatus = (id, status) => setMarks((m) => ({ ...m, [id]: status }));

  const markAll = (status) => {
    const all = {};
    list.forEach((s) => (all[s.id] = status));
    setMarks(all);
  };

  const count = (status) => list.filter((s) => statusOf(s.id) === status).length;

  const save = async () => {
    setSaving(true);
    try {
      const records = {};
      list.forEach((s) => (records[s.id] = statusOf(s.id)));
      const batch = writeBatch(db);
      batch.set(doc(db, "attendance", docId), {
        class: cls,
        date,
        records,
        updatedAt: serverTimestamp(),
      });
      const changes = list
        .filter((student) => (existing?.records?.[student.id] || "(empty)") !== records[student.id])
        .map((student) => ({
          field: `${student.rollNo} - ${student.name}`,
          from: existing?.records?.[student.id] || "(empty)",
          to: records[student.id],
        }));
      addActivityToBatch(batch, {
        action: "update",
        entity: "attendance",
        description: `Saved attendance for ${cls} on ${date}`,
        changes,
      });
      await batch.commit();
      alert("Attendance saved.");
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateReport = async () => {
    const allClasses = reportScope === "all";
    const reportStudents = allClasses
      ? students.data.slice().sort((a, b) => {
          const aClass = CLASSES.indexOf(a.class);
          const bClass = CLASSES.indexOf(b.class);
          return (
            (aClass < 0 ? CLASSES.length : aClass) -
              (bClass < 0 ? CLASSES.length : bClass) ||
            byRoll(a, b)
          );
        })
      : list;
    const recordsByClass = new Map(
      attendance.data
        .filter((record) => record.date === date)
        .map((record) => [record.class, record.records || {}])
    );
    const reportStatusOf = (student) =>
      allClasses && student.class !== cls
        ? recordsByClass.get(student.class)?.[student.id] || "present"
        : statusOf(student.id);
    const absentStudents = reportStudents.filter(
      (student) => reportStatusOf(student) === "absent"
    );
    const reportCount = (status) =>
      reportStudents.filter((student) => reportStatusOf(student) === status).length;
    const canvas = document.createElement("canvas");
    const scale = 2;
    const width = 900;
    const rowHeight = 48;
    const height = 650 + Math.max(absentStudents.length, 1) * rowHeight;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");

    if (!context) {
      alert("Report image could not be created in this browser.");
      return;
    }

    context.scale(scale, scale);
    context.fillStyle = "#f4f7f5";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.fillRect(36, 36, width - 72, height - 72);

    context.fillStyle = "#065f46";
    context.fillRect(36, 36, width - 72, 18);

    context.direction = "rtl";
    context.textAlign = "center";
    context.fillStyle = "#064e3b";
    context.font = 'bold 42px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("مدرسہ دارالعلوم انوار القرآن", width / 2, 132);
    context.direction = "ltr";
    context.fillStyle = "#64748b";
    context.font = "600 19px Arial, sans-serif";
    context.fillText(MADRASA_NAME, width / 2, 170);

    context.fillStyle = "#0f172a";
    context.font = 'bold 34px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.direction = "rtl";
    context.fillText("روزانہ حاضری کی رپورٹ", width / 2, 238);
    context.fillStyle = "#10b981";
    context.fillRect(width / 2 - 48, 260, 96, 4);

    const reportDate = new Date(`${date}T00:00:00`).toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    context.fillStyle = "#334155";
    context.font = '24px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText(
      `تاریخ: ${reportDate}     جماعت: ${allClasses ? "تمام جماعتیں" : cls}`,
      width / 2,
      318
    );

    const summaryY = 380;
    const summaryItems = [
      [`کل طلبہ: ${reportStudents.length}`, "#334155"],
      [`حاضر: ${reportCount("present")}`, "#047857"],
      [`غیر حاضر: ${absentStudents.length}`, "#b91c1c"],
      [`رخصت: ${reportCount("leave")}`, "#b45309"],
      [`تعطیل: ${reportCount("holiday")}`, "#6d28d9"],
    ];
    const summaryWidth = (width - 120) / summaryItems.length;
    context.textAlign = "center";
    context.font = 'bold 21px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    summaryItems.forEach(([label, color], index) => {
      const x = 60 + summaryWidth * (index + 0.5);
      context.fillStyle = "#f8fafc";
      context.fillRect(60 + summaryWidth * index + 5, summaryY - 38, summaryWidth - 10, 78);
      context.fillStyle = color;
      context.fillText(label, x, summaryY + 10);
    });

    context.direction = "rtl";
    context.textAlign = "right";
    context.fillStyle = "#064e3b";
    context.font = 'bold 27px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("غیر حاضر طلبہ کے نام", width - 92, 500);
    context.fillStyle = "#d1fae5";
    context.fillRect(92, 516, width - 184, 2);

    context.fillStyle = "#1e293b";
    context.font = '23px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    if (absentStudents.length === 0) {
      context.textAlign = "center";
      context.fillText("آج کوئی طالب علم غیر حاضر نہیں ہے۔", width / 2, 570);
    } else {
      absentStudents.forEach((student, index) => {
        const y = 566 + index * rowHeight;
        context.fillStyle = index % 2 === 0 ? "#f8fafc" : "#ffffff";
        context.fillRect(82, y - 32, width - 164, rowHeight);
        context.fillStyle = "#1e293b";
        context.textAlign = "right";
        const classLabel = allClasses ? `  —  کلاس: ${student.class}` : "";
        context.fillText(
          `${student.name}${classLabel}  —  رول نمبر: ${student.rollNo || "—"}`,
          width - 102,
          y
        );
      });
    }

    context.direction = "rtl";
    context.textAlign = "center";
    context.fillStyle = "#64748b";
    context.font = '18px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("اللہ تعالیٰ ہمارے طلبہ کو علمِ نافع عطا فرمائے", width / 2, height - 72);

    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Could not encode the report image."));
        }, "image/png");
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-report-${allClasses ? "all-classes" : cls}-${date}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      alert("Report could not be downloaded: " + error.message);
    }
  };

  return (
    <>
      <ErrorNote message={students.error || attendance.error} />

      <Card className="mb-6 flex flex-wrap items-end justify-between gap-4 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Select Class" className="w-48">
            <select className={inputCls} value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Date" className="w-48">
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Report Scope" className="w-48">
            <select
              className={inputCls}
              value={reportScope}
              onChange={(e) => setReportScope(e.target.value)}
            >
              <option value="current">Current Class ({cls})</option>
              <option value="all">All Classes</option>
            </select>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill className="bg-emerald-100 text-emerald-800">Present: {count("present")}</Pill>
          <Pill className="bg-red-100 text-red-700">Absent: {count("absent")}</Pill>
          <Pill className="bg-violet-100 text-violet-800">Holiday: {count("holiday")}</Pill>
          <Pill className="bg-amber-100 text-amber-800">Leave: {count("leave")}</Pill>
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {existing ? "Attendance for this date is already saved (you can edit it)." : "New attendance record."}
        </p>
        <div className="flex gap-3">
          <button onClick={() => markAll("present")} className={`${btnGhost} !py-2 text-sm`}>
            Mark All Present
          </button>
          <button
            onClick={generateReport}
            disabled={
              students.loading ||
              attendance.loading ||
              (reportScope === "all" ? students.data.length === 0 : list.length === 0)
            }
            className={`${btnGhost} !py-2 text-sm`}
          >
            Create Report
          </button>
          <button onClick={save} disabled={saving || list.length === 0} className={`${btnGreen} !py-2`}>
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      <DataTable
        headers={["Roll No", "Student Name", "Status"]}
        loading={students.loading}
        isEmpty={list.length === 0}
        emptyText="No students in this class yet."
      >
        {list.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold`}>{s.rollNo}</td>
            <td className={`${td} font-semibold text-slate-900`}>{s.name}</td>
            <td className={td}>
              <div className="inline-flex overflow-hidden rounded-xl border border-slate-200">
                {STATUSES.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setStatus(s.id, st.key)}
                    className={`px-4 py-1.5 text-xs font-semibold transition ${
                      statusOf(s.id) === st.key ? st.on : st.off
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
