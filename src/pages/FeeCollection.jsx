import { useMemo, useState } from "react";
import { FaMagnifyingGlass, FaPlus, FaTrash } from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { addRecord, removeRecord } from "../utils/db";
import { byRoll, CLASSES, money, monthLabel, sum, today } from "../utils/helpers";
import Modal from "../components/Modal";
import {
  btnGhost,
  btnGreen,
  Card,
  DataTable,
  ErrorNote,
  Field,
  inputCls,
  PageHeader,
  Pill,
  td,
} from "../components/ui";

const emptyForm = () => ({
  class: CLASSES[0],
  studentId: "",
  month: today().slice(0, 7),
  amount: "",
  date: today(),
  notes: "",
});

export default function FeeCollection() {
  const students = useCollection("students");
  const fees = useCollection("fees");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const formStudents = useMemo(
    () => students.data.filter((s) => s.class === form.class).sort(byRoll),
    [students.data, form.class]
  );

  const rows = useMemo(
    () =>
      fees.data
        .filter((f) => !monthFilter || f.month === monthFilter)
        .filter((f) => f.studentName?.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [fees.data, q, monthFilter]
  );

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const changeClass = (e) =>
    setForm({ ...form, class: e.target.value, studentId: "", amount: "" });

  const changeStudent = (e) => {
    const s = students.data.find((x) => x.id === e.target.value);
    setForm({ ...form, studentId: e.target.value, amount: s?.monthlyFee ?? "" });
  };

  const openForm = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    const student = students.data.find((s) => s.id === form.studentId);
    if (!student) {
      alert("Please select a student first.");
      return;
    }

    const dup = fees.data.some(
      (f) => f.studentId === student.id && f.month === form.month
    );
    if (
      dup &&
      !window.confirm(
        `${student.name} has already paid the fee for ${monthLabel(form.month)}. Add it anyway?`
      )
    )
      return;

    setSaving(true);
    try {
      await addRecord("fees", {
        studentId: student.id,
        studentName: student.name,
        rollNo: student.rollNo,
        class: student.class,
        month: form.month,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes.trim(),
      });
      setOpen(false);
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (window.confirm("Delete this fee record?")) {
      await removeRecord("fees", id);
    }
  };

  return (
    <>
      <ErrorNote message={students.error || fees.error} />

      <PageHeader
        title="Fee Collection"
        subtitle={`Total collected${monthFilter ? ` (${monthLabel(monthFilter)})` : ""}: ${money(sum(rows))}`}
        action={
          <button onClick={openForm} className={btnGreen}>
            <FaPlus /> Collect Fee
          </button>
        }
      />

      <Card className="mb-6 flex flex-wrap items-end gap-4 p-5">
        <Field label="Month" className="w-48">
          <input type="month" className={inputCls} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
        </Field>
        <Field label="Search Student" className="w-64">
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={`${inputCls} pl-9`} placeholder="Search name..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </Field>
        {monthFilter && (
          <button onClick={() => setMonthFilter("")} className={`${btnGhost} !py-2.5 text-sm`}>
            Clear Month
          </button>
        )}
      </Card>

      <DataTable
        headers={["Roll No", "Student", "Class", "Month", "Amount", "Paid On", "Notes", "Action"]}
        loading={fees.loading}
        isEmpty={rows.length === 0}
        emptyText="No fee records found."
      >
        {rows.map((f) => (
          <tr key={f.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold`}>{f.rollNo}</td>
            <td className={`${td} font-semibold text-slate-900`}>{f.studentName}</td>
            <td className={td}>
              <Pill className="bg-emerald-100 text-emerald-800">{f.class}</Pill>
            </td>
            <td className={td}>{monthLabel(f.month)}</td>
            <td className={`${td} font-bold text-blue-700`}>{money(f.amount)}</td>
            <td className={td}>{f.date}</td>
            <td className={td}>{f.notes || "-"}</td>
            <td className={td}>
              <button onClick={() => remove(f.id)} className="text-red-500 hover:text-red-700" aria-label="Delete">
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} title="Collect Fee" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Class">
              <select className={inputCls} value={form.class} onChange={changeClass}>
                {CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Student">
              <select required className={inputCls} value={form.studentId} onChange={changeStudent}>
                <option value="">-- Select --</option>
                {formStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.rollNo} - {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fee Month">
              <input required type="month" className={inputCls} value={form.month} onChange={set("month")} />
            </Field>
            <Field label="Amount (Rs.)">
              <input required type="number" min="1" className={inputCls} value={form.amount} onChange={set("amount")} />
            </Field>
          </div>
          <Field label="Payment Date">
            <input required type="date" className={inputCls} value={form.date} onChange={set("date")} />
          </Field>
          <Field label="Notes (optional)">
            <input className={inputCls} value={form.notes} onChange={set("notes")} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnGreen}>
              {saving ? "Saving..." : "Save Fee"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
