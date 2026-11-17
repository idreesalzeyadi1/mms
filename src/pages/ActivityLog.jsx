import useCollection from "../hooks/useCollection";
import {
  DataTable,
  ErrorNote,
  PageHeader,
  Pill,
  td,
} from "../components/ui";

const timeOf = (timestamp) => {
  if (!timestamp?.toDate) return "Just now";
  return timestamp.toDate().toLocaleString();
};

const actionStyle = {
  create: "bg-emerald-100 text-emerald-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-700",
};

export default function ActivityLog() {
  const { data, loading, error } = useCollection("activity");
  const entries = [...data].sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
  );

  return (
    <>
      <ErrorNote message={error} />
      <PageHeader
        title="Activity Log"
        subtitle="Review who changed records and what was updated."
      />
      <DataTable
        headers={["Date & Time", "User", "Action", "Activity", "Changes"]}
        loading={loading}
        isEmpty={entries.length === 0}
        emptyText="No activity has been recorded yet."
      >
        {entries.map((entry) => (
          <tr key={entry.id} className="align-top hover:bg-slate-50/60">
            <td className={`${td} min-w-44`}>{timeOf(entry.createdAt)}</td>
            <td className={td}>
              <div className="font-semibold text-slate-800">
                {entry.actorName || entry.actorEmail || "Unknown user"}
              </div>
              {entry.actorEmail && entry.actorName !== entry.actorEmail && (
                <div className="text-xs text-slate-500">{entry.actorEmail}</div>
              )}
            </td>
            <td className={td}>
              <Pill className={actionStyle[entry.action] || "bg-slate-100 text-slate-700"}>
                {entry.action || "activity"}
              </Pill>
            </td>
            <td className={`${td} min-w-64 font-medium text-slate-800`}>
              {entry.description || entry.entity || "Record changed"}
            </td>
            <td className={`${td} min-w-64`}>
              {entry.changes?.length ? (
                <ul className="space-y-1">
                  {entry.changes.map((change, index) => (
                    <li key={`${change.field}-${index}`} className="text-xs">
                      <span className="font-semibold">{change.field}:</span>{" "}
                      <span className="text-slate-500">{change.from}</span>
                      {" → "}
                      <span className="font-medium text-slate-800">{change.to}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-400">No field details</span>
              )}
            </td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
