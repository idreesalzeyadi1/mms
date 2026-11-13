import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FaBars, FaRightFromBracket } from "react-icons/fa6";
import Sidebar from "./Sidebar";
import { NAV } from "../config/nav";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const current = NAV.find((n) => n.path === pathname);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[75px] items-center justify-between border-b border-slate-100 bg-white pl-4 pr-4 sm:pl-6 lg:pl-10 lg:pr-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <FaBars />
            </button>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {current?.title || "Madrasa Management System"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              MA
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Madrasah Administrator
              </p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <FaRightFromBracket /> Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>

        <footer className="flex items-center justify-between px-6 pb-4 pt-8 text-xs text-slate-400">
          <span>Developed by Risedigitalsolutions</span>
          <span>v1.08</span>
        </footer>
      </div>
    </div>
  );
}
