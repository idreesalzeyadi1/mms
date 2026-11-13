import { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import { db } from "../firebase";
import useCollection from "../hooks/useCollection";
import { addRecord } from "../utils/db";
import { byRoll, CLASSES } from "../utils/helpers";
import Modal from "../components/Modal";
import {
  btnGhost,
  btnGreen,
  Card,
  DataTable,
  ErrorNote,
  Field,
  inputCls,
  td,
} from "../components/ui";

export default function ExamMarksEntry() {
  const students = useCollection("students");
  const exams = useCollection("exams");
  const marks = useCollection("marks");

  const [cls, setCls] = useState(CLASSES[0]);
  const [examId, setExamId] = useState("");
  const [entries, setEntries] = useState({});
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [examForm, setExamForm] = useState({ name: "", totalMarks: 100 });

  const sortedExams = useMemo(
    () =>
      [...exams.data].sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      ),
    [exams.data]
  );
  const exam = exams.data.find((e) => e.id === examId) || sortedExams[0];

  const list = useMemo(
    () => students.data.filter((s) => s.class === cls).sort(byRoll),
    [students.data, cls]
  );

  // Search by name or roll no (Save All still saves every student in the class)
  const visibleList = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (s) =>
        s.name?.toLowerCase().includes(term) || String(s.rollNo) === term
    );
  }, [list, q]);

  // Load saved marks for the selected exam
  useEffect(() => {
    const next = {};
    if (exam) {
      marks.data
        .filter((m) => m.examId === exam.id)
        .forEach((m) => (next[m.studentId] = String(m.obtained)));
    }
    setEntries(next);
  }, [exam?.id, marks.data]);

  const addExam = async (e) => {
    e.preventDefault();
    try {
      await addRecord("exams", {
        name: examForm.name.trim(),
        totalMarks: Number(examForm.totalMarks),
      });
      setExamForm({ name: "", totalMarks: 100 });
      setOpen(false);
      setExamId("");
    } catch (err) {
      alert("Could not save exam: " + err.message);
    }
  };

  const deleteExam = async () => {
    if (!exam) return;
    if (
      !window.confirm(
        `"${exam.name}" and all its marks will be deleted. Are you sure?`
      )
    )
      return;
    const batch = writeBatch(db);
    batch.delete(doc(db, "exams", exam.id));
    marks.data
      .filter((m) => m.examId === exam.id)
      .forEach((m) => batch.delete(doc(db, "marks", m.id)));
    await batch.commit();
    setExamId("");
  };

  const saveAll = async () => {
    if (!exam) return;

    for (const s of list) {
      const v = entries[s.id];
      if (v === undefined || v === "") continue;
      const n = Number(v);
      if (Number.isNaN(n) || n < 0 || n > exam.totalMarks) {
        alert(`${s.name}: marks must be between 0 and ${exam.totalMarks}.`);
        return;
      }
    }

    setSaving(true);
    try {
      const batch = writeBatch(db);
      list.forEach((s) => {
        const ref = doc(db, "marks", `${exam.id}_${s.id}`);
        const v = entries[s.id];
        if (v === undefined || v === "") {
          // if the marks were cleared, remove the old record too
          if (marks.data.some((m) => m.id === ref.id)) batch.delete(ref);
        } else {
          batch.set(ref, {
            examId: exam.id,
            studentId: s.id,
            class: cls,
            obtained: Number(v),
            updatedAt: serverTimestamp(),
          });
        }
      });
      await batch.commit();
      alert("Marks saved.");
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ErrorNote message={students.error || exams.error || marks.error} />

      <Card className="mb-6 flex flex-wrap items-end justify-between gap-4 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Select Class" className="w-44">
            <select className={inputCls} value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Select Exam" className="w-64">
            <select
              className={inputCls}
              value={exam?.id || ""}
              onChange={(e) => setExamId(e.target.value)}
            >
              {sortedExams.length === 0 && <option value="">No exams yet</option>}
              {sortedExams.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.totalMarks} marks)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Search Student" className="w-56">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputCls} pl-9`}
                placeholder="Search name or roll no..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </Field>
          {exam && (
            <button onClick={deleteExam} className="pb-3 text-sm font-semibold text-red-500 hover:text-red-700">
              Delete Exam
            </button>
          )}
        </div>

        <button onClick={() => setOpen(true)} className={btnGreen}>
          <FaPlus /> Add Exam
        </button>
      </Card>

      {exam && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Total marks: <b className="text-slate-800">{exam.totalMarks}</b>
          </p>
          <button onClick={saveAll} disabled={saving || list.length === 0} className={`${btnGreen} !py-2`}>
            {saving ? "Saving..." : "Save All Marks"}
          </button>
        </div>
      )}

      <DataTable
        headers={["Roll No", "Student Name", "Obtained Marks"]}
        loading={students.loading}
        isEmpty={!exam || visibleList.length === 0}
        emptyText={
          !exam
            ? "Create an exam first using 'Add Exam'."
            : "No students found."
        }
      >
        {visibleList.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold`}>{s.rollNo}</td>
            <td className={`${td} font-semibold text-slate-900`}>{s.name}</td>
            <td className={td}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={exam?.totalMarks}
                  className={`${inputCls} !w-28`}
                  value={entries[s.id] ?? ""}
                  onChange={(e) => setEntries({ ...entries, [s.id]: e.target.value })}
                />
                <span className="text-xs text-slate-400">/ {exam?.totalMarks}</span>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} title="Add Exam" onClose={() => setOpen(false)}>
        <form onSubmit={addExam} className="space-y-4">
          <Field label="Exam Name">
            <input
              required
              className={inputCls}
              placeholder="e.g. MID TERM 2026"
              value={examForm.name}
              onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
            />
          </Field>
          <Field label="Total Marks">
            <input
              required
              type="number"
              min="1"
              className={inputCls}
              value={examForm.totalMarks}
              onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" className={btnGreen}>
              Save Exam
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
