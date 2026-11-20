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
    const rowHeight = 56;
    const height = 710 + Math.max(absentStudents.length, 1) * rowHeight;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const context = canvas.getContext("2d");

    if (!context) {
      alert("Report image could not be created in this browser.");
      return;
    }

    const drawRoundedRect = (x, y, rectWidth, rectHeight, radius, fill, stroke) => {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + rectWidth - radius, y);
      context.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + radius);
      context.lineTo(x + rectWidth, y + rectHeight - radius);
      context.quadraticCurveTo(
        x + rectWidth,
        y + rectHeight,
        x + rectWidth - radius,
        y + rectHeight
      );
      context.lineTo(x + radius, y + rectHeight);
      context.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
      context.fillStyle = fill;
      context.fill();
      if (stroke) {
        context.strokeStyle = stroke;
        context.lineWidth = 1;
        context.stroke();
      }
    };

    context.scale(scale, scale);
    context.fillStyle = "#edf3ef";
    context.fillRect(0, 0, width, height);
    drawRoundedRect(26, 24, width - 52, height - 48, 24, "#ffffff", "#dce8df");

    const headerGradient = context.createLinearGradient(36, 36, 864, 260);
    headerGradient.addColorStop(0, "#064e3b");
    headerGradient.addColorStop(1, "#047857");
    drawRoundedRect(38, 36, width - 76, 222, 20, headerGradient);
    context.fillStyle = "#d6b66f";
    context.fillRect(72, 52, width - 144, 3);

    context.save();
    context.globalAlpha = 0.1;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.arc(118, 89, 46, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(782, 205, 72, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.direction = "rtl";
    context.textAlign = "center";
    context.fillStyle = "#f4dfaa";
    context.font = 'bold 42px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("مدرسہ دارالعلوم انوار القرآن", width / 2, 112);
    context.direction = "rtl";
    context.textAlign = "center";
    context.direction = "ltr";
    context.fillStyle = "#d1fae5";
    context.font = "600 16px Arial, sans-serif";
    context.fillText(MADRASA_NAME, width / 2, 143);
    context.fillStyle = "#d6b66f";
    context.fillRect(width / 2 - 38, 160, 76, 2);

    context.direction = "rtl";
    context.fillStyle = "#ffffff";
    context.font = 'bold 32px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("روزانہ حاضری کی رپورٹ", width / 2, 215);

    const reportDate = new Date(`${date}T00:00:00`).toLocaleDateString("ur-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const summaryItems = [
      { label: "کل طلبہ", value: reportStudents.length, color: "#334155", bg: "#f1f5f9" },
      { label: "حاضر", value: reportCount("present"), color: "#047857", bg: "#ecfdf5" },
      { label: "غیر حاضر", value: absentStudents.length, color: "#b91c1c", bg: "#fef2f2" },
      { label: "رخصت", value: reportCount("leave"), color: "#b45309", bg: "#fffbeb" },
      { label: "تعطیل", value: reportCount("holiday"), color: "#6d28d9", bg: "#f5f3ff" },
    ];

    drawRoundedRect(70, 278, width - 140, 82, 16, "#f8faf9", "#e4ece6");
    context.direction = "rtl";
    context.textAlign = "center";
    context.fillStyle = "#64748b";
    context.font = '17px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("تاریخ", 285, 309);
    context.fillText("جماعت", 615, 309);
    context.fillStyle = "#0f172a";
    context.font = 'bold 22px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText(reportDate, 285, 343);
    context.fillText(allClasses ? "تمام جماعتیں" : cls, 615, 343);

    const summaryWidth = 145;
    const summaryGap = 11;
    const summaryStart = (width - summaryItems.length * summaryWidth - (summaryItems.length - 1) * summaryGap) / 2;
    summaryItems.forEach((item, index) => {
      const x = summaryStart + index * (summaryWidth + summaryGap);
      drawRoundedRect(x, 386, summaryWidth, 100, 14, item.bg, "#e8eeea");
      context.direction = "ltr";
      context.textAlign = "center";
      context.fillStyle = item.color;
      context.font = "bold 30px Arial, sans-serif";
      context.fillText(String(item.value), x + summaryWidth / 2, 431);
      context.direction = "rtl";
      context.fillStyle = item.color;
      context.font = 'bold 19px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
      context.fillText(item.label, x + summaryWidth / 2, 468);
    });

    context.direction = "rtl";
    context.textAlign = "right";
    context.fillStyle = "#064e3b";
    context.font = 'bold 26px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("غیر حاضر طلبہ کے نام", width - 80, 538);
    drawRoundedRect(78, 512, 122, 34, 17, "#fef2f2");
    context.textAlign = "center";
    context.fillStyle = "#b91c1c";
    context.font = 'bold 16px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText(`${absentStudents.length} طلبہ`, 139, 535);
    context.fillStyle = "#dce8df";
    context.fillRect(78, 558, width - 156, 1);

    if (absentStudents.length === 0) {
      drawRoundedRect(78, 582, width - 156, 74, 14, "#ecfdf5", "#d1fae5");
      context.beginPath();
      context.arc(width / 2 - 210, 619, 17, 0, Math.PI * 2);
      context.fillStyle = "#10b981";
      context.fill();
      context.textAlign = "center";
      context.fillStyle = "#047857";
      context.font = 'bold 21px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
      context.fillText("آج کوئی طالب علم غیر حاضر نہیں ہے۔", width / 2 + 20, 628);
    } else {
      context.direction = "rtl";
      context.textAlign = "right";
      context.fillStyle = "#94a3b8";
      context.font = '16px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
      context.fillText("نمبر / نام", 818, 583);
      context.textAlign = "center";
      context.fillText("جماعت", 440, 583);
      context.textAlign = "left";
      context.fillText("رول نمبر", 178, 583);

      absentStudents.forEach((student, index) => {
        const rowY = 596 + index * rowHeight;
        drawRoundedRect(
          78,
          rowY,
          width - 156,
          48,
          10,
          index % 2 === 0 ? "#f8faf9" : "#ffffff",
          "#edf2ee"
        );
        context.beginPath();
        context.arc(805, rowY + 24, 14, 0, Math.PI * 2);
        context.fillStyle = "#e7f5ed";
        context.fill();
        context.direction = "ltr";
        context.textAlign = "center";
        context.fillStyle = "#047857";
        context.font = "bold 14px Arial, sans-serif";
        context.fillText(String(index + 1), 805, rowY + 29);
        context.direction = "rtl";
        context.fillStyle = "#1e293b";
        context.font = '19px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
        context.textAlign = "right";
        context.fillText(String(student.name || ""), 776, rowY + 31, 320);
        context.textAlign = "center";
        context.fillStyle = "#475569";
        context.font = "16px Arial, sans-serif";
        context.fillText(String(student.class || "—"), 440, rowY + 30, 180);
        context.direction = "ltr";
        context.textAlign = "left";
        context.fillStyle = "#475569";
        context.font = "16px Arial, sans-serif";
        context.fillText(String(student.rollNo || "—"), 178, rowY + 30, 90);
      });
    }

    const footerY = height - 72;
    context.fillStyle = "#e6ede8";
    context.fillRect(78, footerY, width - 156, 1);
    context.direction = "rtl";
    context.textAlign = "center";
    context.fillStyle = "#64748b";
    context.font = '17px "Noto Nastaliq Urdu", "Noto Naskh Arabic", Arial, sans-serif';
    context.fillText("اللہ تعالیٰ ہمارے طلبہ کو علمِ نافع عطا فرمائے", width / 2, height - 42);

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
