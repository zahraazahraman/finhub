import { useNavigate } from "react-router-dom";

export default function ComingSoon() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("finhub_user") || "{}");

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="relative text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 bg-emerald-500 rounded-xl rotate-6 opacity-30" />
            <div className="absolute inset-0 bg-emerald-400 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-white text-xl font-bold">Fin</span>
            <span className="text-emerald-400 text-xl font-bold">Hub</span>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Under Construction
        </div>

        {/* Greeting */}
        {user?.first_name && (
          <p className="text-slate-400 text-sm mb-2">
            Welcome, <span className="text-white font-medium">{user.first_name}</span> 👋
          </p>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Something great is
          <br />
          <span className="text-emerald-400">coming soon.</span>
        </h1>

        <p className="text-slate-400 text-base leading-relaxed mb-10">
          We're working hard to bring your financial dashboard to life.
          Your account is ready — the experience is almost there.
        </p>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-3 mb-10 text-left">
          {[
            { label: "My Accounts",   icon: "💳" },
            { label: "Goals",         icon: "🎯" },
            { label: "Investments",   icon: "📈" },
            { label: "Consultants",   icon: "🤝" },
            { label: "Reminders",     icon: "🔔" },
            { label: "AI Insights",   icon: "🤖" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
              <span className="text-lg">{f.icon}</span>
              <span className="text-slate-300 text-sm font-medium">{f.label}</span>
              <span className="ml-auto text-xs text-slate-600">Soon</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              sessionStorage.removeItem("finhub_user");
              navigate("/login");
            }}
            className="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            Sign out
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
