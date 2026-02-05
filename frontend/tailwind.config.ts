import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter Tight'", "sans-serif"]
      },
      colors: {
        ink: "#0b0b0f",
        paper: "#f6f1ea",
        accent: "#00b39f",
        accentDeep: "#006b61"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(0,0,0,0.12)",
        ring: "0 0 0 2px rgba(0,179,159,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
