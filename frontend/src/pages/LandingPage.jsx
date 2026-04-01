import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(r) ? "text-yellow-400" : "text-skin-text-muted"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-skin-text-secondary text-xs ml-1">
        {r > 0 ? r.toFixed(1) : "—"}
      </span>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: "My Accounts",
    description:
      "Create and manage multiple accounts. Log transactions manually, import via CSV, or scan receipts with AI-powered OCR.",
    color: "emerald",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Investments",
    description:
      "Track stocks, crypto, and real estate. Get AI-powered analysis with hold, sell, or buy recommendations.",
    color: "blue",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Financial Goals",
    description:
      "Set savings targets and debt repayment goals. Track your progress and stay motivated every step of the way.",
    color: "yellow",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 11l2 2 4-4" />
      </svg>
    ),
    title: "Consultants",
    description:
      "Chat with our AI financial advisor or connect with verified human consultants filtered by your needs.",
    color: "purple",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Smart Reminders",
    description:
      "Never miss a bill again. Set custom email reminders and receive weekly financial summaries automatically.",
    color: "red",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Real-Time Insights",
    description:
      "Get AI-generated spending patterns, anomaly detection, and personalized suggestions to improve your finances.",
    color: "orange",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up in seconds. No bank integration needed — you're in full control of your data.",
  },
  {
    number: "02",
    title: "Add your accounts & transactions",
    description:
      "Manually log your finances, import CSV sheets, or scan receipts with our AI OCR tool.",
  },
  {
    number: "03",
    title: "Track, grow & achieve",
    description:
      "Monitor your spending, hit your goals, and make smarter decisions with AI-powered insights.",
  },
];

const colorMap = {
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-500",
  red: "bg-red-500/10 border-red-500/20 text-red-500",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-500",
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);

  useEffect(() => {
    fetch("/api/public/consultants")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setConsultants(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-skin-base text-skin-text transition-colors duration-200">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-skin-base/80 backdrop-blur-md border-b border-skin-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className="absolute inset-0 bg-emerald-500 rounded-lg rotate-6 opacity-30" />
              <div className="absolute inset-0 bg-emerald-400 rounded-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
            </div>
            <span className="font-bold text-lg">
              <span className="text-skin-text">Fin</span>
              <span className="text-emerald-500">Hub</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Consultants"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-skin-text-secondary hover:text-skin-text text-sm transition-colors duration-150"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered Personal Finance Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-skin-text">
            See where your money goes.
            <br />
            <span className="text-emerald-500">Know where it grows.</span>
          </h1>

          <p className="text-skin-text-secondary text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            FinHub gives you full control over your finances — track spending,
            set goals, manage investments, and get AI-powered insights, all in
            one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
              iconPosition="right"
            >
              Start for free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Sign in to your account
            </Button>
          </div>

          <div className="flex items-center justify-center gap-12 mt-16">
            {[
              { label: "Free to use", icon: "✦" },
              { label: "AI-powered", icon: "✦" },
              { label: "No bank required", icon: "✦" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 text-skin-text-muted text-sm"
              >
                <span className="text-emerald-500 text-xs">{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 bg-skin-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-skin-text mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-skin-text-secondary text-lg max-w-2xl mx-auto">
              From tracking daily expenses to AI-powered investment analysis —
              FinHub has it all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} hover={true} className="group">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorMap[f.color]}`}
                >
                  {f.icon}
                </div>
                <h3 className="text-skin-text font-semibold text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-skin-text-secondary text-sm leading-relaxed">
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-skin-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-skin-text mb-4">
              Get started in 3 simple steps
            </h2>
            <p className="text-skin-text-secondary text-lg">
              No complexity. No bank integration. Just you and your finances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-skin-border" />
                )}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-500 font-bold text-lg">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-skin-text font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-skin-text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consultants ── */}
      <section id="consultants" className="py-24 px-6 bg-skin-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-skin-text mb-4">
              Meet our financial consultants
            </h2>
            <p className="text-skin-text-secondary text-lg max-w-2xl mx-auto">
              Get personalized advice from verified experts or let our AI guide
              you through your financial journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {consultants.length > 0
              ? consultants.map((c) => (
                  <Card key={c.consultant_id} hover={true}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-500 text-lg font-bold">
                          {c.first_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-skin-text font-semibold">
                          {c.first_name} {c.last_name}
                        </p>
                        <p className="text-skin-text-muted text-xs">
                          {c.email}
                        </p>
                      </div>
                    </div>
                    <span className="inline-block bg-skin-hover text-skin-text-secondary text-xs px-3 py-1 rounded-full border border-skin-border mb-3">
                      {c.specialization}
                    </span>
                    <StarRating rating={c.rating} />
                  </Card>
                ))
              : [1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-skin-hover" />
                      <div className="space-y-2">
                        <div className="w-32 h-3 bg-skin-hover rounded" />
                        <div className="w-24 h-2 bg-skin-hover rounded" />
                      </div>
                    </div>
                    <div className="w-20 h-5 bg-skin-hover rounded-full" />
                  </Card>
                ))}
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => navigate("/register")}>
              View all consultants →
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6 bg-skin-base">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-skin-text mb-4">
                Ready to take control?
              </h2>
              <p className="text-skin-text-secondary text-lg mb-8 max-w-xl mx-auto">
                Join FinHub today and start making smarter financial decisions —
                for free.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/register")}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                }
                iconPosition="right"
              >
                Create your free account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-skin-border py-8 px-6 bg-skin-base">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-skin-text">Fin</span>
            <span className="font-bold text-emerald-500">Hub</span>
            <span className="text-skin-text-muted text-sm ml-2">
              · See where your money goes. Know where it grows.
            </span>
          </div>
          <p className="text-skin-text-muted text-sm">
            ©️ {new Date().getFullYear()} FinHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
