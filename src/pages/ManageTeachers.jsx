import { useMemo, useState } from "react";
import { FaKey, FaPen, FaPlus, FaTrash } from "react-icons/fa6";
import useCollection from "../hooks/useCollection";
import { addRecord, updateRecord } from "../utils/db";
import { money, today } from "../utils/helpers";
import { PERMISSIONS } from "../config/permissions";
import { createTeacherAccount } from "../utils/teacherAccounts";
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
  email: "",
  password: "",
});

export default function ManageTeachers() {
  const { data, loading, error } = useCollection("teachers");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [accessTeacher, setAccessTeacher] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);

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

  const closeForm = () => {
    setOpen(false);
    setForm(emptyForm());
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || "",
      phone: t.phone || "",
      subject: t.subject || "",
      salary: t.salary ?? "",
      joiningDate: t.joiningDate || today(),
      email: t.email || "",
      password: "",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentTeacher = data.find((teacher) => teacher.id === editingId);
      const shouldCreateLogin = !currentTeacher?.authUid;
      const payload = {
        name: form.name.trim(),
        phone: form.phone,
        subject: form.subject.trim(),
        salary: Number(form.salary) || 0,
        joiningDate: form.joiningDate,
        email: form.email.trim().toLowerCase(),
      };
      const saveTeacher = async (authUid) => {
        const teacherData = { ...payload, authUid };
        if (editingId) await updateRecord("teachers", editingId, teacherData);
        else await addRecord("teachers", teacherData);
      };

      if (shouldCreateLogin) {
        if (form.password.length < 6) {
          alert("Set an initial password with at least 6 characters.");
          return;
        }
        await createTeacherAccount(payload.email, form.password, saveTeacher);
      } else {
        await saveTeacher(currentTeacher.authUid);
      }
      setForm(emptyForm());
      setOpen(false);
    } catch (err) {
      alert("Could not save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openAccess = (teacher) => {
    setAccessTeacher(teacher);
    setPermissions(teacher.permissions || {});
  };

  const saveAccess = async () => {
    if (!accessTeacher?.email) {
      alert("Add the teacher's sign-in email first, then assign access.");
      return;
    }

    const changedPermissions = PERMISSIONS.filter(
      ({ key }) =>
        Boolean(accessTeacher.permissions?.[key]) !== Boolean(permissions[key])
    ).map(({ key, label }) => ({
      field: label,
      from: accessTeacher.permissions?.[key] ? "Allowed" : "No access",
      to: permissions[key] ? "Allowed" : "Revoked",
    }));
    setSavingPermissions(true);
    try {
      await updateRecord(
        "teachers",
        accessTeacher.id,
        { permissions },
        {
          description: `Changed section access for teacher "${accessTeacher.name}"`,
          changes: changedPermissions,
        }
      );
      setAccessTeacher(null);
    } catch (err) {
      alert("Could not update access: " + err.message);
    } finally {
      setSavingPermissions(false);
    }
  };

  const remove = async (t) => {
    if (window.confirm(`Revoke all access for "${t.name}"?`)) {
      try {
        await updateRecord(
          "teachers",
          t.id,
          { permissions: {}, active: false },
          {
            description: `Revoked all access for teacher "${t.name}"`,
            changes: PERMISSIONS.filter(({ key }) => t.permissions?.[key]).map(
              ({ label }) => ({ field: label, from: "Allowed", to: "Revoked" })
            ),
          }
        );
      } catch (err) {
        alert("Could not revoke access: " + err.message);
      }
    }
  };

  const restore = async (teacher) => {
    try {
      await updateRecord("teachers", teacher.id, { active: true });
    } catch (err) {
      alert("Could not restore teacher: " + err.message);
    }
  };

  return (
    <>
      <ErrorNote message={error} />

      <PageHeader
        title="Teachers"
        subtitle="Create a teacher login with an initial password, then choose which sections they can access."
        action={
          <button onClick={openAdd} className={btnGreen}>
            <FaPlus /> Add Teacher
          </button>
        }
      />

      <DataTable
        headers={["Teacher Name", "Email", "Phone", "Subject / Class", "Salary", "Joining Date", "Action"]}
        loading={loading}
        isEmpty={rows.length === 0}
        emptyText="No teachers added yet."
      >
        {rows.map((t) => (
          <tr key={t.id} className="hover:bg-slate-50/60">
            <td className={`${td} font-semibold text-slate-900`}>{t.name}</td>
            <td className={td}>
              {t.email || "-"}
              {t.active === false && (
                <span className="ml-2 text-xs font-semibold text-red-600">Access revoked</span>
              )}
            </td>
            <td className={td}>{t.phone || "-"}</td>
            <td className={td}>{t.subject || "-"}</td>
            <td className={`${td} font-semibold`}>{money(t.salary)}</td>
            <td className={td}>{t.joiningDate || "-"}</td>
            <td className={td}>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => openAccess(t)}
                  className="text-emerald-700 hover:text-emerald-900"
                  aria-label="Manage access"
                  title="Manage access"
                >
                  <FaKey />
                </button>
                <button onClick={() => openEdit(t)} className="text-blue-500 hover:text-blue-700" aria-label="Edit">
                  <FaPen />
                </button>
                {t.active === false ? (
                  <button
                    onClick={() => restore(t)}
                    className="text-emerald-700 hover:text-emerald-900"
                    aria-label="Restore teacher"
                    title="Restore teacher"
                  >
                    Restore
                  </button>
                ) : (
                  <button onClick={() => remove(t)} className="text-red-500 hover:text-red-700" aria-label="Revoke all access" title="Revoke all access">
                    <FaTrash />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal open={open} title={editingId ? "Edit Teacher" : "Add Teacher"} onClose={closeForm}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Teacher Name">
            <input required className={inputCls} value={form.name} onChange={set("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teacher Login Email">
              <input
                type="email"
                required
                readOnly={Boolean(data.find((teacher) => teacher.id === editingId)?.authUid)}
                className={inputCls}
                value={form.email}
                onChange={set("email")}
              />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={form.phone} onChange={set("phone")} />
            </Field>
            <Field label="Subject / Class">
              <input className={inputCls} value={form.subject} onChange={set("subject")} />
            </Field>
          </div>
          {!data.find((teacher) => teacher.id === editingId)?.authUid ? (
            <Field label="Initial Login Password (at least 6 characters)">
              <input
                type="password"
                required
                minLength="6"
                autoComplete="new-password"
                className={inputCls}
                value={form.password}
                onChange={set("password")}
              />
              <span className="mt-1 block text-xs text-slate-500">
                Share this password with the teacher so they can sign in.
              </span>
            </Field>
          ) : (
            <p className="text-xs text-slate-500">
              Login is active. The existing password is not stored or shown here.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monthly Salary (Rs.)">
              <input type="number" min="0" className={inputCls} value={form.salary} onChange={set("salary")} />
            </Field>
            <Field label="Joining Date">
              <input type="date" className={inputCls} value={form.joiningDate} onChange={set("joiningDate")} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeForm} className={btnGhost}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnGreen}>
              {saving ? "Saving..." : editingId ? "Update Teacher" : "Save Teacher"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(accessTeacher)}
        title={`Section Access${accessTeacher ? ` — ${accessTeacher.name}` : ""}`}
        onClose={() => setAccessTeacher(null)}
      >
        {accessTeacher?.email ? (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Access is linked to <b className="text-slate-700">{accessTeacher.email}</b>.
              Changes take effect for the teacher's next page load and can be changed anytime.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PERMISSIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-600"
                    checked={Boolean(permissions[key])}
                    onChange={(event) =>
                      setPermissions((current) => ({
                        ...current,
                        [key]: event.target.checked,
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setAccessTeacher(null)} className={btnGhost}>
                Cancel
              </button>
              <button
                onClick={saveAccess}
                disabled={savingPermissions}
                className={btnGreen}
              >
                {savingPermissions ? "Saving..." : "Save Access"}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              This teacher needs a login email before section access can be assigned.
            </p>
            <button
              onClick={() => {
                const teacher = accessTeacher;
                setAccessTeacher(null);
                openEdit(teacher);
              }}
              className={btnGreen}
            >
              Add Login Email
            </button>
          </div>
        )}
      </Modal>
    </>
  );
}
