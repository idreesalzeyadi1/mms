import { useState } from "react";
import { Navigate } from "react-router-dom";
import { FaMosque } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { btnGreen, Field, inputCls } from "../components/ui";

const errorText = (code) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Please check your internet connection.";
    default:
      return "Login failed. Please try again.";
  }
};

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(errorText(err.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-3xl text-emerald-100">
            <FaMosque />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Madrasa Dar Ul Uloom Anwar Ul Quran
          </h1>
          <p className="text-sm text-emerald-700">Management System</p>
        </div>

        <div className="space-y-4">
          <Field label="Email">
            <input
              type="email"
              required
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className={`${btnGreen} mt-6 w-full`}>
          {busy ? "Signing in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          Developed by Risedigitalsolutions
        </p>
      </form>
    </div>
  );
}
