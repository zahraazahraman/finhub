import Card from "../ui/Card.jsx";

const colorMap = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    red:     "bg-red-500/10 border-red-500/20 text-red-500",
    blue:    "bg-blue-500/10 border-blue-500/20 text-blue-500",
    yellow:  "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
    purple:  "bg-purple-500/10 border-purple-500/20 text-purple-500",
    slate:   "bg-skin-hover border-skin-border text-skin-text-secondary",
};

export default function DashboardStatCard({ label, value, sub, color = "emerald", icon, trend }) {
    return (
        <Card padding="md">
            <div className="flex items-start justify-between mb-3">
                <p className="text-skin-text-secondary text-sm">{label}</p>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-skin-text">{value}</p>
            <div className="flex items-center justify-between mt-1">
                {sub && <p className="text-skin-text-muted text-xs">{sub}</p>}
                {trend !== undefined && (
                    <span className={`text-xs font-medium ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
                    </span>
                )}
            </div>
        </Card>
    );
}