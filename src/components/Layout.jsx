import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FaBars, FaRightFromBracket } from "react-icons/fa6";
import Sidebar from "./Sidebar";
import { NAV } from "../config/nav";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const {
    user,
    loading,
    accessLoading,
    accessError,
    teacher,
    hasAccess,
    logout,
  } = useAuth();
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

  if (accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }
  if (accessError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="font-bold text-slate-900">Could not verify access</h2>
          <p className="mt-2 text-sm text-red-700">{accessError}</p>
        </div>
      </div>
    );
  }

  const navItems = NAV.filter(
    (item) =>
      (!item.adminOnly || !teacher) &&
      (!item.permission || hasAccess(item.permission))
  );
  const current = NAV.find((n) => n.path === pathname);
  const canOpenCurrent = current && navItems.some((item) => item.path === current.path);
  const firstAllowedPath = navItems[0]?.path;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex min-h-[75px] items-center justify-between gap-2 border-b border-slate-100 bg-white px-3 py-3 sm:px-6 lg:pl-10 lg:pr-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <FaBars />
            </button>
            <h2 className="min-w-0 break-words text-base font-bold text-slate-900 sm:text-xl">
              {current?.title || "Madrasa Management System"}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800 sm:h-10 sm:w-10">
              MA
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {teacher?.name || "Madrasah Administrator"}
              </p>
              <p className="text-xs text-slate-500">
                {teacher ? "Teacher" : "Administrator"}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 sm:px-3"
            >
              <FaRightFromBracket /> Logout
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-3 sm:p-6">
          {canOpenCurrent ? (
            <Outlet />
          ) : firstAllowedPath ? (
            <Navigate to={firstAllowedPath} replace />
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">No access assigned</h2>
              <p className="mt-2 text-sm text-slate-500">
                Please contact the administrator to get access to a section.
              </p>
            </div>
          )}
        </main>

        <footer className="flex items-center justify-between px-6 pb-4 pt-8 text-xs text-slate-400">
          <span>Developed by Risedigitalsolutions</span>
          <span>v1.08</span>
        </footer>
      </div>
    </div>
  );
}
