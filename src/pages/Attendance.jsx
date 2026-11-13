import { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import useCollection from "../hooks/useCollection";
import { byRoll, CLASSES, today } from "../utils/helpers";
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
  { key: "leave", label: "Leave", on: "bg-amber-500 text-white", off: "text-amber-600 hover:bg-amber-50" },
];

export default function Attendance() {
  const students = useCollection("students");
  const attendance = useCollection("attendance");

  const [cls, setCls] = useState(CLASSES[0]);
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
      await setDoc(doc(db, "attendance", docId), {
        class: cls,
        date,
        records,
        updatedAt: serverTimestamp(),
      });
      alert("Attendance saved.");
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill className="bg-emerald-100 text-emerald-800">Present: {count("present")}</Pill>
          <Pill className="bg-red-100 text-red-700">Absent: {count("absent")}</Pill>
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
