import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const labels = {
  donations: "donation",
  expenses: "expense",
  exams: "exam",
  fees: "fee payment",
  marks: "marks",
  students: "student",
  teachers: "teacher",
};

const displayValue = (value) => {
  if (value === undefined || value === null || value === "") return "(empty)";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const fieldLabel = (field) =>
  field.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());

const getChanges = (before, after) =>
  Object.keys(after)
    .filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after[key]))
    .map((field) => ({
      field: fieldLabel(field),
      from: displayValue(before?.[field]),
      to: displayValue(after[field]),
    }));

const recordLabel = (name, data) => {
  const label = labels[name] || name;
  const subject =
    data.name ||
    data.studentName ||
    data.title ||
    data.donorName ||
    data.email ||
    "";
  if (name === "fees") {
    return `fee payment for ${subject || "student"} (${data.month || "month not set"})`;
  }
  if (name === "marks") return `marks for ${subject || "student"}`;
  return `${label}${subject ? ` "${subject}"` : ""}`;
};

export const addActivityToBatch = (
  batch,
  { action, entity, description, changes = [] }
) => {
  const user = auth.currentUser;
  const activityRef = doc(collection(db, "activity"));
  batch.set(activityRef, {
    action,
    entity,
    description,
    changes,
    actorName: user?.displayName || user?.email || "Unknown user",
    actorEmail: user?.email || "",
    actorUid: user?.uid || "",
    createdAt: serverTimestamp(),
  });
};

const saveWithActivity = (write, activity) => {
  const batch = writeBatch(db);
  write(batch);
  addActivityToBatch(batch, activity);
  return batch.commit();
};

export const addRecord = (name, data) => {
  const ref = doc(collection(db, name));
  const label = recordLabel(name, data);
  const changes = getChanges({}, data);
  return saveWithActivity(
    (batch) =>
      batch.set(ref, { ...data, createdAt: serverTimestamp() }),
    {
      action: "create",
      entity: labels[name] || name,
      description: `Added ${label}`,
      changes,
    }
  ).then(() => ({ id: ref.id }));
};

export const updateRecord = async (name, id, data, options = {}) => {
  const ref = doc(db, name, id);
  const snapshot = await getDoc(ref);
  const before = snapshot.exists() ? snapshot.data() : {};
  const changes = options.changes || getChanges(before, data);
  const label = recordLabel(name, { ...before, ...data });
  return saveWithActivity(
    (batch) => batch.update(ref, data),
    {
      action: "update",
      entity: labels[name] || name,
      description: options.description || `Updated ${label}`,
      changes,
    }
  );
};

export const removeRecord = async (name, id) => {
  const ref = doc(db, name, id);
  const snapshot = await getDoc(ref);
  const data = snapshot.exists() ? snapshot.data() : {};
  const label = recordLabel(name, data);
  return saveWithActivity(
    (batch) => batch.delete(ref),
    {
      action: "delete",
      entity: labels[name] || name,
      description: `Deleted ${label}`,
    }
  );
};
