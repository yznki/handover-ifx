/** @type {import("tailwindcss").Config} */
export default {
  darkMode: "class",
  content: ["./app/**/*.{vue,ts}", "./content/**/*.md"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        hairline: "rgb(var(--color-hairline) / <alpha-value>)",
        violet: {
          50: "rgb(var(--color-violet-50) / <alpha-value>)",
          100: "rgb(var(--color-violet-100) / <alpha-value>)",
          300: "rgb(var(--color-violet-300) / <alpha-value>)",
          400: "rgb(var(--color-violet-400) / <alpha-value>)",
          500: "rgb(var(--color-violet-500) / <alpha-value>)",
          600: "rgb(var(--color-violet-600) / <alpha-value>)",
          700: "rgb(var(--color-violet-700) / <alpha-value>)",
          900: "rgb(var(--color-violet-900) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular"],
        hand: ["Caveat", "cursive"]
      },
      boxShadow: {
        editorial: "0 28px 80px rgba(42, 23, 101, 0.16)",
        violet: "0 20px 60px rgba(109, 59, 255, 0.28)"
      }
    }
  }
};
