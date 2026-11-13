import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export const addRecord = (name, data) =>
  addDoc(collection(db, name), { ...data, createdAt: serverTimestamp() });

export const updateRecord = (name, id, data) =>
  updateDoc(doc(db, name, id), data);

export const removeRecord = (name, id) => deleteDoc(doc(db, name, id));
