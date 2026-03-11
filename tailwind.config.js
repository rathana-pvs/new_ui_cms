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
        "primary": {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
          container: "#e0e0ff",
          "on-container": "#1a1a3b",
        },
        "secondary": {
          DEFAULT: "#5c5e70",
          container: "#e1e0f9",
        },
        "surface": {
          DEFAULT: "#fdfbff",
          variant: "#e4e1ec",
          dark: "#1b1b1f",
          "dark-variant": "#47464f",
        },
        "accent-red": "#ba1a1a",
        "accent-orange": "#f97316",
        "accent-yellow": "#eab308",
        "accent-green": "#548d0e",
        "accent-blue": "#0ea5e9",
        "accent-purple": "#8b5cf6",
        "background-light": "#fdfbff",
        "background-dark": "#1b1b1f",
      },
      fontFamily: {
        "display": ["'Outfit'", "Inter", "sans-serif"],
        "sans": ["'Outfit'", "Inter", "sans-serif"],
        "mono": ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        "none": "0",
        "xs": "2px",
        "sm": "2px",
        "DEFAULT": "2px",
        "md": "2px",
        "lg": "2px",
        "xl": "2px",
        "2xl": "2px",
        "3xl": "2px",
        "full": "2px"
      },
      boxShadow: {
        "none": "none",
        "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "DEFAULT": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "m3-1": "none",
        "m3-2": "none",
        "m3-3": "none",
      }
    },
  },
  plugins: [],
}
