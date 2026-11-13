import { useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { addRecord, removeRecord } from "../utils/db";
import { EXPENSE_CATEGORIES, money, today } from "../utils/helpers";
import Modal from "../components/Modal";
import {
  btnAmber,
  btnGhost,
  DataTable,
  ErrorNote,
  Field,
  inputCls,
  PageHeader,
  Pill,
  td,
} from "../components/ui";

const emptyForm = () => ({
  title: "",
  category: EXPENSE_CATEGORIES[0],
  amount: "",
  date: today(),
  description: "",
});

export default function Expenses() {
  const { data, loading, error } = useCollection("expenses");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () => [...data].sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [data]
  );

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openForm = () => {
    setForm(emptyForm());
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addRecord("expenses", {
        ...form,
        title: form.title.trim(),
        amount: Number(form.amount),
      });
      setOpen(false);
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (window.confirm("Delete this expense?")) {
      await removeRecord("expenses", id);
    }
  };

  return (
    <>
      <ErrorNote message={error} />

      <PageHeader
        title="Madrasah Expenses"
        subtitle="Track utility bills, food, salaries, maintenance with detailed descriptions."
        action={
          <button onClick={openForm} className={btnAmber}>
            <FaPlus /> Add Expense
          </button>
        }
      />

      <DataTable
        headers={["Title", "Category", "Amount", "Date", "Description", "Action"]}
        loading={loading}
        isEmpty={rows.length === 0}
        emptyText="No expenses recorded yet."
      >
        {rows.map((x) => (
          <tr key={x.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold text-slate-900`}>{x.title}</td>
            <td className={td}>
              <Pill className="bg-amber-100 text-amber-800">{x.category}</Pill>
            </td>
            <td className={`${td} font-bold text-amber-700`}>{money(x.amount)}</td>
            <td className={td}>{x.date}</td>
            <td className={td}>{x.description || "-"}</td>
            <td className={td}>
              <button
                onClick={() => remove(x.id)}
                className="text-red-500 transition hover:text-red-700"
                aria-label="Delete"
              >
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} title="Add Expense" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <input required className={inputCls} value={form.title} onChange={set("title")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select className={inputCls} value={form.category} onChange={set("category")}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Amount (Rs.)">
              <input required type="number" min="1" className={inputCls} value={form.amount} onChange={set("amount")} />
            </Field>
          </div>
          <Field label="Date">
            <input required type="date" className={inputCls} value={form.date} onChange={set("date")} />
          </Field>
          <Field label="Description">
            <textarea rows="3" className={inputCls} value={form.description} onChange={set("description")} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnAmber}>
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
