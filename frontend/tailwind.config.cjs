/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          dark:    "var(--brand-dark)",
          light:   "var(--brand-light)",
        },
        skin: {
          base:             "var(--bg-primary)",
          secondary:        "var(--bg-secondary)",
          card:             "var(--bg-card)",
          input:            "var(--bg-input)",
          hover:            "var(--bg-hover)",
          border:           "var(--border)",
          "border-subtle":  "var(--border-subtle)",
          text:             "var(--text-primary)",
          "text-secondary": "var(--text-secondary)",
          "text-muted":     "var(--text-muted)",
          sidebar:          "var(--sidebar-bg)",
          "sidebar-border": "var(--sidebar-border)",
          topbar:           "var(--topbar-bg)",
          // Pre-computed brand opacity variants
          // (CSS variable colors can't use Tailwind's /opacity modifier)
          "brand-subtle":   "var(--brand-subtle)",
        },
      },
      animation: {
        "fade-in":        "fadeIn 0.3s ease-out",
        "slide-up":       "slideUp 0.4s ease-out",
        "scale-in":       "scaleIn 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:      { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn:      { from: { opacity: 0, transform: "scale(0.95)" }, to: { opacity: 1, transform: "scale(1)" } },
        slideInRight: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
      },
    },
  },
  plugins: [],
};