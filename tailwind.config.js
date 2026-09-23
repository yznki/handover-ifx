/** @type {import("tailwindcss").Config} */
export default {
  content: ["./app/**/*.{vue,ts}", "./content/**/*.md"],
  theme: {
    extend: {
      colors: {
        paper: "#F6F4EF",
        ink: "#151417",
        muted: "#6F6A62",
        violet: {
          50: "#F0EBFF",
          100: "#E1D6FF",
          400: "#8D67FF",
          500: "#6D3BFF",
          700: "#4E27C5",
          900: "#2A1765"
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
