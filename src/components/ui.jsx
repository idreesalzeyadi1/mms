// Shared UI pieces used by every page

export const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100";

export const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[15px] font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60";
export const btnGreen = `${btnBase} bg-emerald-600 hover:bg-emerald-700`;
export const btnAmber = `${btnBase} bg-amber-600 hover:bg-amber-700`;
export const btnDark = `${btnBase} bg-slate-800 hover:bg-slate-900`;
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50";

export const td = "px-6 py-4 text-sm text-slate-700";

export function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </Card>
  );
}

export function DataTable({ headers, loading, isEmpty, emptyText, children }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-6 text-center text-sm text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-5 text-center text-sm text-slate-400"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Pill({ children, className = "bg-slate-100 text-slate-700" }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function ErrorNote({ message }) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Firestore error: {message}
    </div>
  );
}
