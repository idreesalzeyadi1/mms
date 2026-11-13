import { useMemo, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { addRecord, removeRecord } from "../utils/db";
import { DONATION_TYPES, money, today } from "../utils/helpers";
import Modal from "../components/Modal";
import {
  btnGreen,
  btnGhost,
  DataTable,
  ErrorNote,
  Field,
  inputCls,
  PageHeader,
  Pill,
  td,
} from "../components/ui";

const typeStyle = {
  Zakat: "bg-emerald-100 text-emerald-800",
  Sadaqa: "bg-blue-100 text-blue-800",
  General: "bg-slate-100 text-slate-700",
};

const emptyForm = () => ({
  donorName: "",
  type: "Zakat",
  amount: "",
  date: today(),
  notes: "",
});

export default function Donations() {
  const { data, loading, error } = useCollection("donations");
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
      await addRecord("donations", {
        ...form,
        donorName: form.donorName.trim(),
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
    if (window.confirm("Delete this donation record?")) {
      await removeRecord("donations", id);
    }
  };

  return (
    <>
      <ErrorNote message={error} />

      <PageHeader
        title="Charity & Donations Records"
        subtitle="Manage all incoming Zakat, Sadaqa, and General donations."
        action={
          <button onClick={openForm} className={btnGreen}>
            <FaPlus /> Add Donation
          </button>
        }
      />

      <DataTable
        headers={["Donor Name", "Type", "Amount", "Date", "Contact / Notes", "Action"]}
        loading={loading}
        isEmpty={rows.length === 0}
        emptyText="No donations recorded yet."
      >
        {rows.map((d) => (
          <tr key={d.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold text-slate-900`}>{d.donorName}</td>
            <td className={td}>
              <Pill className={typeStyle[d.type]}>{d.type}</Pill>
            </td>
            <td className={`${td} font-bold text-emerald-700`}>{money(d.amount)}</td>
            <td className={td}>{d.date}</td>
            <td className={td}>{d.notes || "-"}</td>
            <td className={td}>
              <button
                onClick={() => remove(d.id)}
                className="text-red-500 transition hover:text-red-700"
                aria-label="Delete"
              >
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} title="Add Donation" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Donor Name">
            <input required className={inputCls} value={form.donorName} onChange={set("donorName")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select className={inputCls} value={form.type} onChange={set("type")}>
                {DONATION_TYPES.map((t) => (
                  <option key={t}>{t}</option>
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
          <Field label="Contact / Notes">
            <textarea rows="3" className={inputCls} value={form.notes} onChange={set("notes")} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnGreen}>
              {saving ? "Saving..." : "Save Donation"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
