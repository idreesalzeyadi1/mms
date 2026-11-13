import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaMagnifyingGlass, FaPrint } from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { CLASSES, gradeOf, MADRASA_NAME, ordinal } from "../utils/helpers";
import Modal from "../components/Modal";
import ReportCard from "../components/ReportCard";
import {
  btnDark,
  btnGhost,
  btnGreen,
  Card,
  ErrorNote,
  Field,
  inputCls,
  Pill,
} from "../components/ui";

const positionStyle = (p) =>
  p === 1
    ? "bg-amber-100 text-amber-800"
    : p === 2
    ? "bg-slate-200 text-slate-700"
    : p === 3
    ? "bg-orange-100 text-orange-800"
    : "bg-slate-100 text-slate-600";

export default function ExamResults() {
  const students = useCollection("students");
  const exams = useCollection("exams");
  const marks = useCollection("marks");

  const [cls, setCls] = useState(CLASSES[0]);
  const [examId, setExamId] = useState("");
  const [q, setQ] = useState("");
  const [reportRow, setReportRow] = useState(null);

  const sortedExams = useMemo(
    () =>
      [...exams.data].sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      ),
    [exams.data]
  );
  const exam = exams.data.find((e) => e.id === examId) || sortedExams[0];

  // Rank by marks (equal marks => same position)
  const ranked = useMemo(() => {
    if (!exam) return [];
    const list = students.data
      .filter((s) => s.class === cls)
      .map((s) => {
        const m = marks.data.find(
          (x) => x.examId === exam.id && x.studentId === s.id
        );
        return m ? { student: s, obtained: Number(m.obtained) } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.obtained - a.obtained);

    let prev = null;
    let pos = 0;
    return list.map((r, i) => {
      if (r.obtained !== prev) {
        pos = i + 1;
        prev = r.obtained;
      }
      const percentage = (r.obtained / exam.totalMarks) * 100;
      return { ...r, position: pos, percentage, grade: gradeOf(percentage) };
    });
  }, [students.data, marks.data, exam, cls]);

  const visible = ranked.filter((r) =>
    r.student.name?.toLowerCase().includes(q.toLowerCase())
  );

  const heading = exam ? `Position-wise Merit List - ${cls} · ${exam.name}` : "";

  return (
    <>
      <ErrorNote message={students.error || exams.error || marks.error} />

      {/* Filters */}
      <Card className="mb-6 flex flex-wrap items-end justify-between gap-4 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Select Class" className="w-40">
            <select className={inputCls} value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Select Exam" className="w-60">
            <select className={inputCls} value={exam?.id || ""} onChange={(e) => setExamId(e.target.value)}>
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
                placeholder="Search name..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </Field>
        </div>

        <button onClick={() => window.print()} disabled={ranked.length === 0} className={btnDark}>
          <FaPrint /> Print Merit List / PDF
        </button>
      </Card>

      {/* Merit table */}
      <Card className="p-6">
        <div className="border-b border-slate-100 pb-4 text-center">
          <h3 className="text-2xl font-bold text-emerald-900">{MADRASA_NAME}</h3>
          <p className="text-sm text-slate-600">{heading || "No exam selected"}</p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                {["Position", "Roll No", "Student Name", "Total Obtained Marks", "Percentage", "Grade", "Action / Report Card"].map((h) => (
                  <th key={h} className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">
                    {exam ? "No marks have been entered for this class and exam." : "Create an exam and enter marks first."}
                  </td>
                </tr>
              ) : (
                visible.map((r) => (
                  <tr key={r.student.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-4">
                      <Pill className={positionStyle(r.position)}>{ordinal(r.position)} Position</Pill>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold">{r.student.rollNo}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{r.student.name}</td>
                    <td className="px-4 py-4 text-sm font-bold text-emerald-700">
                      {r.obtained} / {exam.totalMarks}
                    </td>
                    <td className="px-4 py-4 text-sm">{r.percentage.toFixed(1)}%</td>
                    <td className="px-4 py-4">
                      <Pill className="bg-emerald-100 text-emerald-800">{r.grade}</Pill>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setReportRow(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <FaPrint /> Report Card
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Report card preview */}
      <Modal
        open={!!reportRow}
        title="Student Report Card"
        size="max-w-3xl"
        onClose={() => setReportRow(null)}
      >
        {reportRow && (
          <>
            <ReportCard row={reportRow} exam={exam} cls={cls} totalStudents={ranked.length} />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setReportRow(null)} className={btnGhost}>
                Close
              </button>
              <button onClick={() => window.print()} className={btnGreen}>
                <FaPrint /> Print Report Card
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Elements visible only when printing */}
      {reportRow &&
        createPortal(
          <div className="print-only">
            <ReportCard row={reportRow} exam={exam} cls={cls} totalStudents={ranked.length} />
          </div>,
          document.body
        )}

      {!reportRow &&
        exam &&
        createPortal(
          <div className="print-only text-slate-900">
            <div className="mb-4 text-center">
              <h1 className="text-2xl font-bold">{MADRASA_NAME}</h1>
              <p className="text-sm">{heading}</p>
            </div>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {["Position", "Roll No", "Student Name", "Obtained", "Percentage", "Grade"].map((h) => (
                    <th key={h} className="border border-slate-400 bg-slate-100 px-3 py-2 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ranked.map((r) => (
                  <tr key={r.student.id}>
                    <td className="border border-slate-400 px-3 py-2">{ordinal(r.position)}</td>
                    <td className="border border-slate-400 px-3 py-2">{r.student.rollNo}</td>
                    <td className="border border-slate-400 px-3 py-2">{r.student.name}</td>
                    <td className="border border-slate-400 px-3 py-2">
                      {r.obtained} / {exam.totalMarks}
                    </td>
                    <td className="border border-slate-400 px-3 py-2">{r.percentage.toFixed(1)}%</td>
                    <td className="border border-slate-400 px-3 py-2">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
          document.body
        )}
    </>
  );
}
