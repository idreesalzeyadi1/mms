import { useMemo, useState } from "react";
import { FaMagnifyingGlass, FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { addRecord, removeRecord, updateRecord } from "../utils/db";
import { byRoll, CLASSES, money } from "../utils/helpers";
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
  name: "",
  fatherName: "",
  rollNo: "",
  class: CLASSES[0],
  contact: "",
  monthlyFee: "",
});

export default function Students() {
  const { data, loading, error } = useCollection("students");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  const rows = useMemo(
    () =>
      data
        .filter((s) => classFilter === "All" || s.class === classFilter)
        .filter((s) => s.name?.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => a.class.localeCompare(b.class) || byRoll(a, b)),
    [data, q, classFilter]
  );

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name || "",
      fatherName: s.fatherName || "",
      rollNo: s.rollNo ?? "",
      class: s.class,
      contact: s.contact || "",
      monthlyFee: s.monthlyFee ?? "",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    const clash = data.find(
      (s) =>
        s.id !== editingId &&
        s.class === form.class &&
        String(s.rollNo) === String(form.rollNo)
    );
    if (clash) {
      alert(`Roll no ${form.rollNo} in class "${form.class}" already belongs to "${clash.name}".`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        rollNo: Number(form.rollNo),
        monthlyFee: Number(form.monthlyFee) || 0,
      };
      if (editingId) await updateRecord("students", editingId, payload);
      else await addRecord("students", payload);
      setOpen(false);
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    if (window.confirm(`Delete "${s.name}"?`)) {
      await removeRecord("students", s.id);
    }
  };

  return (
    <>
      <ErrorNote message={error} />

      <PageHeader
        title="Students"
        subtitle="Register students, manage class and roll numbers."
        action={
          <button onClick={openAdd} className={btnGreen}>
            <FaPlus /> Add Student
          </button>
        }
      />

      <Card className="mb-6 flex flex-wrap items-end gap-4 p-5">
        <Field label="Class" className="w-48">
          <select className={inputCls} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option>All</option>
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Search Student" className="w-64">
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
      </Card>

      <DataTable
        headers={["Roll No", "Student Name", "Father Name", "Class", "Contact", "Monthly Fee", "Action"]}
        loading={loading}
        isEmpty={rows.length === 0}
        emptyText="No students found."
      >
        {rows.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold`}>{s.rollNo}</td>
            <td className={`${td} font-semibold text-slate-900`}>{s.name}</td>
            <td className={td}>{s.fatherName || "-"}</td>
            <td className={td}>
              <Pill className="bg-emerald-100 text-emerald-800">{s.class}</Pill>
            </td>
            <td className={td}>{s.contact || "-"}</td>
            <td className={`${td} font-semibold`}>{money(s.monthlyFee)}</td>
            <td className={td}>
              <div className="flex items-center gap-4">
                <button onClick={() => openEdit(s)} className="text-blue-500 hover:text-blue-700" aria-label="Edit">
                  <FaPen />
                </button>
                <button onClick={() => remove(s)} className="text-red-500 hover:text-red-700" aria-label="Delete">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} title={editingId ? "Edit Student" : "Add Student"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Student Name">
              <input required className={inputCls} value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Father Name">
              <input className={inputCls} value={form.fatherName} onChange={set("fatherName")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Class">
              <select className={inputCls} value={form.class} onChange={set("class")}>
                {CLASSES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Roll No">
              <input required type="number" min="1" className={inputCls} value={form.rollNo} onChange={set("rollNo")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact">
              <input className={inputCls} value={form.contact} onChange={set("contact")} />
            </Field>
            <Field label="Monthly Fee (Rs.)">
              <input type="number" min="0" className={inputCls} value={form.monthlyFee} onChange={set("monthlyFee")} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnGreen}>
              {saving ? "Saving..." : editingId ? "Update Student" : "Save Student"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
