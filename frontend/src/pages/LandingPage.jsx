import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { useInView } from "../hooks/useInView.js";
import HeroGrid from "../components/landing/HeroGrid.jsx";

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
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: "My Accounts",
    description: "Create and manage multiple accounts. Log transactions manually, import via CSV, or scan receipts with AI-powered OCR.",
    color: "emerald",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Investments",
    description: "Track stocks, crypto, and real estate. Get AI-powered analysis with hold, sell, or buy recommendations.",
    color: "blue",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Financial Goals",
    description: "Set savings targets and debt repayment goals. Track your progress and stay motivated every step of the way.",
    color: "yellow",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 11l2 2 4-4" />
      </svg>
    ),
    title: "Consultants",
    description: "Chat with our AI financial advisor or connect with verified human consultants filtered by your needs.",
    color: "purple",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Smart Reminders",
    description: "Never miss a bill again. Set custom email reminders and receive weekly financial summaries automatically.",
    color: "red",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: "Real-Time Insights",
    description: "Get AI-generated spending patterns, anomaly detection, and personalized suggestions to improve your finances.",
    color: "orange",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up in seconds. No bank integration needed — you're in full control of your data.",
  },
  {
    number: "02",
    title: "Add your accounts & transactions",
    description: "Manually log your finances, import CSV sheets, or scan receipts with our AI OCR tool.",
  },
  {
    number: "03",
    title: "Track, grow & achieve",
    description: "Monitor your spending, hit your goals, and make smarter decisions with AI-powered insights.",
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

const staggerClass = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6"];

/* ── Small section-header component ── */
function SectionHeader({ eyebrow, title, subtitle, inView }) {
  return (
    <div className="text-center mb-16">
      {eyebrow && (
        <p className={`reveal ${inView ? "in-view" : ""} stagger-1 text-emerald-500 text-sm font-medium uppercase tracking-widest mb-3`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`reveal ${inView ? "in-view" : ""} stagger-2 text-3xl md:text-4xl font-bold text-skin-text mb-4`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`reveal ${inView ? "in-view" : ""} stagger-3 text-skin-text-secondary text-lg max-w-2xl mx-auto`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [consultants, setConsultants] = useState([]);

  /* navbar scroll state */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/public/consultants")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setConsultants(data); });
  }, []);

  /* hero parallax blob */
  const blobRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(-50%, ${window.scrollY * 0.18}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* hero content entrance — delayed so it feels intentional */
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* section refs */
  const [featuresRef, featuresInView]       = useInView();
  const [stepsRef, stepsInView]             = useInView();
  const [consultantsRef, consultantsInView] = useInView();
  const [ctaRef, ctaInView]                 = useInView();
  const [dualCtaRef, dualCtaInView]         = useInView();
  const [contactRef, contactInView]         = useInView();

  /* contact form state */
  const [contactForm, setContactForm]     = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState("idle"); // idle | sending | success | error
  const [contactError, setContactError]   = useState("");

  const handleContactChange = (e) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("sending");
    setContactError("");
    try {
      const res  = await fetch("/api/public/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setContactStatus("success");
      setContactForm({ name: "", email: "", message: "" });
    } catch (err) {
      setContactStatus("error");
      setContactError(err.message);
    }
  };


  return (
    <div className="min-h-screen bg-skin-base text-skin-text transition-colors duration-200">

      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-skin-border transition-all duration-300 ${
          scrolled
            ? "bg-skin-base/95 backdrop-blur-md shadow-sm"
            : "bg-skin-base/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className="absolute inset-0 bg-emerald-500 rounded-lg rotate-6 opacity-30" />
              <div className="absolute inset-0 bg-emerald-400 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
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

          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Consultants", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-skin-text-secondary hover:text-skin-text text-sm transition-colors duration-150"
              >
                {item}
              </a>
            ))}
            <a
              href="/become-a-consultant"
              className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors duration-150"
            >
              Become a Consultant
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/register")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <HeroGrid />
        <div
          ref={blobRef}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
          style={{ willChange: "transform" }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div
            className={`reveal ${heroVisible ? "in-view" : ""} stagger-1 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium px-4 py-2 rounded-full mb-8`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered Personal Finance Platform
          </div>

          <h1 className={`reveal ${heroVisible ? "in-view" : ""} stagger-2 text-5xl md:text-6xl font-bold leading-tight mb-6 text-skin-text`}>
            See where your money goes.
            <br />
            <span className="text-emerald-500">Know where it grows.</span>
          </h1>

          <p className={`reveal ${heroVisible ? "in-view" : ""} stagger-3 text-skin-text-secondary text-lg leading-relaxed max-w-2xl mx-auto mb-10`}>
            FinHub gives you full control over your finances — track spending,
            set goals, manage investments, and get AI-powered insights, all in
            one place.
          </p>

          <div className={`reveal ${heroVisible ? "in-view" : ""} stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4`}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
              iconPosition="right"
            >
              Start for free
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
              Sign in to your account
            </Button>
          </div>

          <div className={`reveal ${heroVisible ? "in-view" : ""} stagger-5 flex items-center justify-center gap-12 mt-16`}>
            {[
              { label: "Free to use", icon: "✦" },
              { label: "AI-powered", icon: "✦" },
              { label: "No bank required", icon: "✦" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-skin-text-muted text-sm">
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
          <div ref={featuresRef}>
            <SectionHeader
              eyebrow="What's inside"
              title="Everything you need to manage your finances"
              subtitle="From tracking daily expenses to AI-powered investment analysis — FinHub has it all."
              inView={featuresInView}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`reveal ${featuresInView ? "in-view" : ""} ${staggerClass[i]} group`}
              >
                <Card hover={true} className="h-full">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-skin-text font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-skin-text-secondary text-sm leading-relaxed">{f.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-6 bg-skin-secondary">
        <div className="max-w-4xl mx-auto">
          <div ref={stepsRef}>
            <SectionHeader
              eyebrow="Getting started"
              title="Get started in 3 simple steps"
              subtitle="No complexity. No bank integration. Just you and your finances."
              inView={stepsInView}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`reveal ${stepsInView ? "in-view" : ""} ${staggerClass[i]} relative text-center`}
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-skin-border" />
                )}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-emerald-500 font-bold text-lg">{step.number}</span>
                  </div>
                  <h3 className="text-skin-text font-semibold mb-2">{step.title}</h3>
                  <p className="text-skin-text-secondary text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consultants ── */}
      <section id="consultants" className="py-24 px-6 bg-skin-secondary">
        <div className="max-w-6xl mx-auto">
          <div ref={consultantsRef}>
            <SectionHeader
              eyebrow="Expert guidance"
              title="Meet our financial consultants"
              subtitle="Get personalized advice from verified experts or let our AI guide you through your financial journey."
              inView={consultantsInView}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {consultants.length > 0
              ? consultants.map((c, i) => (
                  <div
                    key={c.consultant_id}
                    className={`reveal ${consultantsInView ? "in-view" : ""} ${staggerClass[i]}`}
                  >
                    <Card hover={true} className="h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-500 text-lg font-bold">
                            {c.first_name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-skin-text font-semibold">{c.first_name} {c.last_name}</p>
                          <p className="text-skin-text-muted text-xs">{c.email}</p>
                        </div>
                      </div>
                      <span className="inline-block bg-skin-hover text-skin-text-secondary text-xs px-3 py-1 rounded-full border border-skin-border mb-3">
                        {c.specialization}
                      </span>
                      <StarRating rating={c.rating} />
                    </Card>
                  </div>
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

          <div className={`reveal ${consultantsInView ? "in-view" : ""} stagger-4 text-center mb-12`}>
            <Button variant="outline" onClick={() => navigate("/register")}>
              View all consultants →
            </Button>
          </div>

          {/* ── Dual CTA banner ── */}
          <div ref={dualCtaRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`reveal ${dualCtaInView ? "in-view" : ""} stagger-1 flex flex-col gap-3 bg-skin-card border border-skin-border rounded-2xl p-6`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-skin-text">Looking for financial guidance?</p>
                <p className="text-sm text-skin-text-secondary mt-1 leading-relaxed">
                  Create a free account and connect with a verified consultant matched to your needs.
                </p>
              </div>
              <Button variant="primary" size="sm" className="w-fit" onClick={() => navigate("/register")}>
                Get started for free
              </Button>
            </div>

            <div className={`reveal ${dualCtaInView ? "in-view" : ""} stagger-2 flex flex-col gap-3 bg-skin-card border border-emerald-500/30 rounded-2xl p-6`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-skin-text">Are you a financial expert?</p>
                <p className="text-sm text-skin-text-secondary mt-1 leading-relaxed">
                  Join our network of verified consultants and help users achieve their financial goals.
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-fit" onClick={() => navigate("/become-a-consultant")}>
                Apply to join →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6 bg-skin-base">
        <div ref={ctaRef} className="max-w-4xl mx-auto">
          <div className={`reveal ${ctaInView ? "in-view" : ""} relative bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-12 text-center overflow-hidden`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className={`reveal ${ctaInView ? "in-view" : ""} stagger-2 text-3xl md:text-4xl font-bold text-skin-text mb-4`}>
                Ready to take control?
              </h2>
              <p className={`reveal ${ctaInView ? "in-view" : ""} stagger-3 text-skin-text-secondary text-lg mb-8 max-w-xl mx-auto`}>
                Join FinHub today and start making smarter financial decisions — for free.
              </p>
              <div className={`reveal ${ctaInView ? "in-view" : ""} stagger-4`}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/register")}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-6 bg-skin-secondary">
        <div className="max-w-2xl mx-auto">
          <div ref={contactRef}>
            <SectionHeader
              eyebrow="Get in touch"
              title="Contact us"
              subtitle="Have a question or feedback? We'd love to hear from you."
              inView={contactInView}
            />
          </div>

          <div className={`reveal ${contactInView ? "in-view" : ""} stagger-4`}>
            {contactStatus === "success" ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="text-skin-text font-semibold text-lg mb-2">Message sent!</h3>
                <p className="text-skin-text-secondary text-sm mb-6">We'll get back to you as soon as possible.</p>
                <Button variant="outline" size="sm" onClick={() => setContactStatus("idle")}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className={`reveal ${contactInView ? "in-view" : ""} stagger-4 grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                  <div>
                    <label className="block text-sm font-medium text-skin-text mb-1.5">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="Your name"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-skin-card border border-skin-border text-skin-text placeholder:text-skin-text-muted text-sm focus:outline-none focus:border-emerald-500/50 transition-colors duration-150"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-skin-text mb-1.5">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-skin-card border border-skin-border text-skin-text placeholder:text-skin-text-muted text-sm focus:outline-none focus:border-emerald-500/50 transition-colors duration-150"
                    />
                  </div>
                </div>

                <div className={`reveal ${contactInView ? "in-view" : ""} stagger-5`}>
                  <label className="block text-sm font-medium text-skin-text mb-1.5">Message</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Tell us how we can help..."
                    required
                    rows={5}
                    className="w-full px-4 py-2.5 rounded-xl bg-skin-card border border-skin-border text-skin-text placeholder:text-skin-text-muted text-sm focus:outline-none focus:border-emerald-500/50 transition-colors duration-150 resize-none"
                  />
                </div>

                {contactStatus === "error" && (
                  <p className="text-red-500 text-sm">{contactError}</p>
                )}

                <div className={`reveal ${contactInView ? "in-view" : ""} stagger-6`}>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={contactStatus === "sending"}
                    icon={
                      contactStatus === "sending" ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      )
                    }
                    iconPosition="right"
                  >
                    {contactStatus === "sending" ? "Sending..." : "Send message"}
                  </Button>
                </div>
              </form>
            )}
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
