import Spinner from "./Spinner.jsx";

export default function Table({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found.",
  className = "",
}) {
  return (
    <div className={`bg-skin-card border border-skin-border rounded-2xl overflow-hidden animate-slide-up ${className}`}
    style={{ boxShadow: 'var(--shadow-md)' }}>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-skin-text-muted text-sm">
          {emptyMessage}
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-skin-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-xs font-medium text-skin-text-muted uppercase tracking-wider px-6 py-4"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-skin-border">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-skin-hover transition-colors duration-150">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render ? col.render(row) : (
                      <span className="text-skin-text text-sm">{row[col.key]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}