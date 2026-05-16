import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import Button from "../components/ui/Button.jsx";

const SPECIALIZATIONS = [
  "Debt Management",
  "Investment Planning",
  "Savings Planning",
  "Budgeting & Expense Tracking",
  "Tax Planning",
  "Retirement Planning",
  "Insurance Planning",
  "Other",
];

const EMPTY_FORM = {
  first_name:       "",
  last_name:        "",
  email:            "",
  phone:            "",
  specialization:   "",
  custom_spec:      "",
  years_experience: "",
  bio:              "",
  motivation:       "",
  linkedin_url:     "",
};

function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-skin-text">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-skin-text-muted">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-skin-card border border-skin-border rounded-xl px-4 py-2.5 text-sm text-skin-text placeholder-skin-text-muted outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all";

export default function BecomeConsultantPage() {
  const navigate = useNavigate();
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const spec = form.specialization === "Other"
      ? form.custom_spec.trim()
      : form.specialization;

    if (!spec) {
      setError("Please specify your area of specialization.");
      return;
    }

    setSubmitting(true);
    try {
      const res  = await fetch("/api/public/consultant-apply", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, specialization: spec }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-skin-base text-skin-text transition-colors duration-200">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-skin-base/80 backdrop-blur-md border-b border-skin-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
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
          </button>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium px-4 py-2 rounded-full mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Join our Expert Network
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-skin-text mb-3">
              Become a Consultant
            </h1>
            <p className="text-skin-text-secondary text-base leading-relaxed max-w-lg mx-auto">
              Share your financial expertise with thousands of FinHub users.
              Our team reviews every application to ensure quality.
            </p>
          </div>

          {submitted ? (
            /* ── Success state ── */
            <div className="bg-skin-card border border-skin-border rounded-2xl p-10 text-center flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-skin-text">Application submitted!</h2>
                <p className="text-skin-text-secondary text-sm mt-2 leading-relaxed max-w-sm mx-auto">
                  Thank you for applying. We'll review your profile and get back
                  to you within 3–5 business days via email.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back to home
              </Button>
            </div>
          ) : (
            /* ── Application form ── */
            <form
              onSubmit={handleSubmit}
              className="bg-skin-card border border-skin-border rounded-2xl p-8 flex flex-col gap-6"
            >

              {/* Personal info */}
              <div>
                <p className="text-xs font-semibold text-skin-text-muted uppercase tracking-wider mb-4">
                  Personal Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={set("first_name")}
                      placeholder="Sarah"
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Last Name" required>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={set("last_name")}
                      placeholder="Mitchell"
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Email Address" required>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="sarah@example.com"
                      required
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Phone Number">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+1 555 000 0000"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              {/* Professional info */}
              <div>
                <p className="text-xs font-semibold text-skin-text-muted uppercase tracking-wider mb-4">
                  Professional Background
                </p>
                <div className="flex flex-col gap-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Area of Specialization" required>
                      <select
                        value={form.specialization}
                        onChange={set("specialization")}
                        required
                        className={inputCls}
                      >
                        <option value="">Select specialization…</option>
                        {SPECIALIZATIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Years of Experience" required>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={form.years_experience}
                        onChange={set("years_experience")}
                        placeholder="e.g. 8"
                        required
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {form.specialization === "Other" && (
                    <Field label="Please specify" required>
                      <input
                        type="text"
                        value={form.custom_spec}
                        onChange={set("custom_spec")}
                        placeholder="e.g. Estate Planning"
                        className={inputCls}
                      />
                    </Field>
                  )}

                  <Field
                    label="Professional Bio"
                    required
                    hint="Tell us about your background, certifications, and the clients you typically work with."
                  >
                    <textarea
                      value={form.bio}
                      onChange={set("bio")}
                      rows={4}
                      placeholder="I'm a certified financial planner with 8 years of experience helping individuals and families…"
                      required
                      className={inputCls + " resize-none"}
                    />
                  </Field>

                  <Field
                    label="Why do you want to join FinHub?"
                    required
                    hint="What value do you bring, and why is FinHub the right platform for you?"
                  >
                    <textarea
                      value={form.motivation}
                      onChange={set("motivation")}
                      rows={3}
                      placeholder="I want to reach people who are actively tracking their finances and help them take the next step…"
                      required
                      className={inputCls + " resize-none"}
                    />
                  </Field>

                  <Field label="LinkedIn / Website URL">
                    <input
                      type="url"
                      value={form.linkedin_url}
                      onChange={set("linkedin_url")}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 -mt-2">{error}</p>
              )}

              {/* Submit */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full sm:w-auto justify-center"
                >
                  Submit Application
                </Button>
                <p className="text-xs text-skin-text-muted text-center sm:text-left">
                  We review every application personally and respond within 3–5 business days.
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

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
            © {new Date().getFullYear()} FinHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
