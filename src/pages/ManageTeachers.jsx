import { useMemo, useState } from "react";
import { FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { addRecord, removeRecord, updateRecord } from "../utils/db";
import { money, today } from "../utils/helpers";
import Modal from "../components/Modal";
import {
  btnGhost,
  btnGreen,
  DataTable,
  ErrorNote,
  Field,
  inputCls,
  PageHeader,
  td,
} from "../components/ui";

const emptyForm = () => ({
  name: "",
  phone: "",
  subject: "",
  salary: "",
  joiningDate: today(),
});

export default function ManageTeachers() {
  const { data, loading, error } = useCollection("teachers");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () => [...data].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [data]
  );

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || "",
      phone: t.phone || "",
      subject: t.subject || "",
      salary: t.salary ?? "",
      joiningDate: t.joiningDate || today(),
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        subject: form.subject.trim(),
        salary: Number(form.salary) || 0,
      };
      if (editingId) await updateRecord("teachers", editingId, payload);
      else await addRecord("teachers", payload);
      setOpen(false);
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    if (window.confirm(`Delete "${t.name}"?`)) {
      await removeRecord("teachers", t.id);
    }
  };

  return (
    <>
      <ErrorNote message={error} />

      <PageHeader
        title="Teachers"
        subtitle="Manage teaching staff, subjects and salaries."
        action={
          <button onClick={openAdd} className={btnGreen}>
            <FaPlus /> Add Teacher
          </button>
        }
      />

      <DataTable
        headers={["Teacher Name", "Phone", "Subject / Class", "Salary", "Joining Date", "Action"]}
        loading={loading}
        isEmpty={rows.length === 0}
        emptyText="No teachers added yet."
      >
        {rows.map((t) => (
          <tr key={t.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold text-slate-900`}>{t.name}</td>
            <td className={td}>{t.phone || "-"}</td>
            <td className={td}>{t.subject || "-"}</td>
            <td className={`${td} font-semibold`}>{money(t.salary)}</td>
            <td className={td}>{t.joiningDate || "-"}</td>
            <td className={td}>
              <div className="flex items-center gap-4">
                <button onClick={() => openEdit(t)} className="text-blue-500 hover:text-blue-700" aria-label="Edit">
                  <FaPen />
                </button>
                <button onClick={() => remove(t)} className="text-red-500 hover:text-red-700" aria-label="Delete">
                  <FaTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} title={editingId ? "Edit Teacher" : "Add Teacher"} onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Teacher Name">
            <input required className={inputCls} value={form.name} onChange={set("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone">
              <input className={inputCls} value={form.phone} onChange={set("phone")} />
            </Field>
            <Field label="Subject / Class">
              <input className={inputCls} value={form.subject} onChange={set("subject")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monthly Salary (Rs.)">
              <input type="number" min="0" className={inputCls} value={form.salary} onChange={set("salary")} />
            </Field>
            <Field label="Joining Date">
              <input type="date" className={inputCls} value={form.joiningDate} onChange={set("joiningDate")} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnGreen}>
              {saving ? "Saving..." : editingId ? "Update Teacher" : "Save Teacher"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
