import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Card from "../ui/Card.jsx";

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="border border-skin-border rounded-2xl px-4 py-3 text-sm"
             style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-lg)" }}>
            <p className="text-skin-text font-semibold mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: entry.color }} />
                    <span className="text-skin-text-secondary capitalize">{entry.name}:</span>
                    <span className="text-skin-text font-medium">
                        {Number(entry.value).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function DashboardBarChart({ data = [] }) {
    // Format "2026-03" → "Mar 26" for the axis
    const formatted = data.map((row) => {
        const [year, month] = row.month.split("-");
        const label = new Date(year, month - 1).toLocaleDateString("en-US", {
            month: "short", year: "2-digit",
        });
        return { ...row, label };
    });

    return (
        <Card padding="md">
            <div className="mb-6">
                <h2 className="text-skin-text font-semibold">Income vs Expenses</h2>
                <p className="text-skin-text-muted text-xs mt-0.5">
                    Monthly breakdown for the selected period
                </p>
            </div>

            {data.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-skin-text-muted text-sm">
                    No transaction data for this period.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                        data={formatted}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                        barCategoryGap="30%"
                        barGap={4}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-hover)", radius: 6 }} />
                        <Legend
                            wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 16 }}
                            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                        />
                        <Bar dataKey="income"  name="income"  fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="expense" name="expense" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}
