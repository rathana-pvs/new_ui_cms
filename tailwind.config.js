/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#ffc107",
        "bk-main": "#121212",
        "bk-side": "#1e1e1e",
        "bk-yellow": "#ffc107",
        "accent-red": "#f43f5e",
        "accent-orange": "#f97316",
        "accent-yellow": "#ffc107",
        "accent-green": "#10b981",
        "accent-blue": "#0ea5e9",
        "accent-purple": "#8b5cf6",
        "background-light": "#f6f6f8",
        "background-dark": "#121212",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
        "mono": ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        "none": "0",
        "sm": "0.25rem",
        "DEFAULT": "0.25rem",
        "md": "0.25rem",
        "lg": "0.25rem",
        "xl": "0.25rem",
        "2xl": "0.25rem",
        "3xl": "0.25rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

