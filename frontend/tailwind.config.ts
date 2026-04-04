import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Lexend", "sans-serif"],
        body: ["Lexend", "sans-serif"]
      },
      colors: {
        primary: "#1D9E75",
        "background-light": "#f6f7f8",
        "background-dark": "#111821",
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        ring: "hsl(var(--ring))"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      borderWidth: {
        "0.5": "0.5px"
      }
    }
  },
  plugins: []
};

export default config;
