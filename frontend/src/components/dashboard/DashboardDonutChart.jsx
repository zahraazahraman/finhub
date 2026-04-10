import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../ui/Card.jsx";

// Enough colors for a realistic number of categories
const COLORS = [
    "#10b981", "#f87171", "#60a5fa", "#facc15",
    "#a78bfa", "#fb923c", "#f472b6", "#34d399",
    "#38bdf8", "#e879f9",
];

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value, percent } = payload[0].payload;
    return (
        <div className="border border-skin-border rounded-2xl px-4 py-3 text-sm"
             style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-lg)" }}>
            <p className="text-skin-text font-semibold mb-1">{name}</p>
            <p className="text-skin-text-secondary">
                Amount:{" "}
                <span className="text-skin-text font-medium">
                    {Number(value).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            </p>
            <p className="text-skin-text-secondary">
                Share:{" "}
                <span className="text-skin-text font-medium">
                    {(percent * 100).toFixed(1)}%
                </span>
            </p>
        </div>
    );
};

export default function DashboardDonutChart({ data = [], categoryType = "expense" }) {
    // Shape data for Recharts
    const shaped = data.map((row) => ({
        name:  row.category_name,
        value: parseFloat(row.total),
    }));

    const total = shaped.reduce((sum, row) => sum + row.value, 0);

    return (
        <Card padding="md">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-skin-text font-semibold">
                    {categoryType === "expense" ? "Spending" : "Income"} by Category
                </h2>
                <p className="text-skin-text-muted text-xs mt-0.5">
                    {categoryType === "expense"
                        ? "Where your money is going this period"
                        : "Where your money is coming from this period"}
                </p>
            </div>

            {shaped.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-skin-text-muted text-sm">
                    No {categoryType} data for this period.
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Donut */}
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={shaped}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {shaped.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={COLORS[i % COLORS.length]}
                                        stroke="transparent"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend — category rows with % bar */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {shaped.map((row, i) => {
                            const pct = total > 0
                                ? ((row.value / total) * 100).toFixed(1)
                                : 0;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    {/* Color dot */}
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    />
                                    {/* Name + bar */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-skin-text text-xs truncate">{row.name}</span>
                                            <span className="text-skin-text-muted text-xs ml-2 flex-shrink-0">
                                                {pct}%
                                            </span>
                                        </div>
                                        <div className="h-1 bg-skin-hover rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${pct}%`,
                                                    backgroundColor: COLORS[i % COLORS.length],
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
}