import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setTeacher(null);
      setAccessError(null);
      setAccessLoading(Boolean(u));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setTeacher(null);
      setAccessError(null);
      setAccessLoading(false);
      return undefined;
    }

    const email = user.email.trim().toLowerCase();
    const teacherQuery = query(
      collection(db, "teachers"),
      where("email", "==", email)
    );
    return onSnapshot(
      teacherQuery,
      (snapshot) => {
        setTeacher(
          snapshot.empty
            ? null
            : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
        );
        setAccessError(null);
        setAccessLoading(false);
      },
      (error) => {
        console.error("[teacher access]", error);
        setAccessError(error.message);
        setAccessLoading(false);
      }
    );
  }, [user]);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  const hasAccess = (permission) =>
    !teacher ||
    (teacher.active !== false && Boolean(teacher.permissions?.[permission]));

  return (
    <AuthContext.Provider
      value={{
        user,
        teacher,
        loading,
        accessLoading,
        accessError,
        hasAccess,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
