import { MADRASA_NAME, ordinal } from "../utils/helpers";

// Report card — used for both the on-screen preview and printing
export default function ReportCard({ row, exam, cls, totalStudents }) {
  const { student, obtained, percentage, grade, position } = row;
  const passed = percentage >= 40;

  const info = [
    ["Student Name", student.name],
    ["Father Name", student.fatherName || "-"],
    ["Roll No", student.rollNo],
    ["Class", cls],
  ];

  const results = [
    ["Exam", exam.name],
    ["Total Marks", exam.totalMarks],
    ["Obtained Marks", obtained],
    ["Percentage", `${percentage.toFixed(1)}%`],
    ["Grade", grade],
    ["Position", `${ordinal(position)} (out of ${totalStudents})`],
    ["Result", passed ? "PASS" : "FAIL"],
  ];

  return (
    <div className="mx-auto w-full max-w-2xl border-2 border-emerald-800 p-4 text-slate-900 sm:p-6">
      <div className="border-b-2 border-emerald-800 pb-3 text-center">
        <h1 className="break-words text-xl font-bold text-emerald-900 sm:text-2xl">{MADRASA_NAME}</h1>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-600">
          Student Report Card
        </p>
      </div>

      <table className="mt-5 w-full border-collapse text-sm">
        <tbody>
          {info.map(([k, v]) => (
            <tr key={k}>
              <td className="w-1/3 border border-slate-300 bg-slate-50 px-3 py-2 font-semibold">
                {k}
              </td>
              <td className="border border-slate-300 px-3 py-2">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="mt-5 w-full border-collapse text-sm">
        <tbody>
          {results.map(([k, v]) => (
            <tr key={k}>
              <td className="w-1/3 border border-slate-300 bg-emerald-50 px-3 py-2 font-semibold">
                {k}
              </td>
              <td
                className={`border border-slate-300 px-3 py-2 font-semibold ${
                  k === "Result"
                    ? passed
                      ? "text-emerald-700"
                      : "text-red-600"
                    : ""
                }`}
              >
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-14 flex flex-wrap justify-between gap-6 text-xs font-semibold text-slate-600">
        <span className="border-t border-slate-500 px-3 pt-1 sm:px-6">Class Teacher</span>
        <span className="border-t border-slate-500 px-3 pt-1 sm:px-6">Principal</span>
      </div>
    </div>
  );
}
