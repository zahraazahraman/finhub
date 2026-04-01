import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

const features = [
  { label: "My Accounts",  icon: "💳" },
  { label: "Goals",        icon: "🎯" },
  { label: "Investments",  icon: "📈" },
  { label: "Consultants",  icon: "🤝" },
  { label: "Reminders",    icon: "🔔" },
  { label: "AI Insights",  icon: "🤖" },
];

export default function ComingSoon() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-skin-base flex items-center justify-center px-6 transition-colors duration-200">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center max-w-lg w-full">
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
            <span className="text-skin-text text-xl font-bold">Fin</span>
            <span className="text-emerald-500 text-xl font-bold">Hub</span>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Under Construction
        </div>

        {/* Greeting */}
        {user?.first_name && (
          <p className="text-skin-text-secondary text-sm mb-2">
            Welcome, <span className="text-skin-text font-medium">{user.first_name}</span> 👋
          </p>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-skin-text mb-4">
          Something great is
          <br />
          <span className="text-emerald-500">coming soon.</span>
        </h1>

        <p className="text-skin-text-secondary text-base leading-relaxed mb-10">
          We're working hard to bring your financial dashboard to life.
          Your account is ready — the experience is almost there.
        </p>

        {/* Features preview */}
        <div className="grid grid-cols-2 gap-3 mb-10 text-left">
          {features.map((f) => (
            <Card key={f.label} padding="sm" className="flex items-center gap-3">
              <span className="text-lg">{f.icon}</span>
              <span className="text-skin-text text-sm font-medium">{f.label}</span>
              <span className="ml-auto text-xs text-skin-text-muted">Soon</span>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="secondary" size="md" onClick={handleLogout}>
            Sign out
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate("/")}>
            Back to home
          </Button>
        </div>
      </div>
    </div>
  );
}