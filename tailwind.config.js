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
        "primary": "#6366f1",
        "accent-red": "#f43f5e",
        "accent-orange": "#f97316",
        "accent-yellow": "#eab308",
        "accent-green": "#10b981",
        "accent-blue": "#0ea5e9",
        "accent-purple": "#8b5cf6",
        "background-light": "#f6f6f8",
        "background-dark": "#121520",
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
