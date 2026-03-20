/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: "#FDF6EC",           // warm cream
          secondary: "#F7EFE5",    // dark cream
          card: "#FFFFFF",
          text: "#2C2C2C",         // dark grey primary text
          muted: "#5C5C5C",        // secondary text
          faint: "#9A8F84",        // muted text
          accent: "#C8A97E",       // gold-beige
          border: "#EADFD0",       // border soft
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "ui-serif", "Georgia", "serif"],
      }
    },
  },
  plugins: [],
};
