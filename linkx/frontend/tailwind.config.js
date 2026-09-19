/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#e6edfe",
          200: "#c2d3fc",
          300: "#9db8f9",
          400: "#5482f4",
          500: "#0a4bef",
          600: "#0942d6",
          700: "#0736ab",
          800: "#062a86",
          900: "#052163",
        },
        ink: {
          900: "#0b1220",
          800: "#151d2e",
          700: "#26314a",
          600: "#3c496399",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
