import { NavLink } from "react-router-dom";
import { FaMosque } from "react-icons/fa6";
import { NAV } from "../config/nav";

export default function Sidebar({ open, onClose, navItems }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto bg-emerald-900 px-2 pb-6 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-start gap-3 px-4 pb-6 pt-8">
          <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-2xl text-emerald-200">
            <FaMosque />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-snug text-white">
              Madrasa Dar Ul Uloom Anwar Ul Quran
            </h1>
            <p className="text-[13px] text-emerald-300">Management System</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-2 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium transition ${
                  isActive
                    ? "bg-emerald-800 text-emerald-100"
                    : "text-emerald-200 hover:bg-emerald-800/60"
                }`
              }
            >
              <Icon className="w-5 shrink-0 text-lg text-emerald-300" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
