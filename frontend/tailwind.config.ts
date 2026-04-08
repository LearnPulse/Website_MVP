import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Lexend", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        primary: "#1D9E75",
        canvas:  "#09090b",
        surface: "#111115",
        line:    "#1d1d22",
        ink:     "#ededed",
        dim:     "#666672",
        ghost:   "#2a2a32",
      },
      fontSize: {
        "2xs": ["0.65rem",  { lineHeight: "1rem" }],
        xs:    ["0.75rem",  { lineHeight: "1.125rem" }],
        sm:    ["0.8125rem",{ lineHeight: "1.25rem" }],
        base:  ["0.9375rem",{ lineHeight: "1.5rem" }],
        lg:    ["1.0625rem",{ lineHeight: "1.625rem" }],
        xl:    ["1.1875rem",{ lineHeight: "1.75rem" }],
        "2xl": ["1.4375rem",{ lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.5rem",   { lineHeight: "1.1" }],
        "5xl": ["3.25rem",  { lineHeight: "1" }],
      },
      borderRadius: {
        sm:  "3px",
        DEFAULT: "5px",
        md:  "7px",
        lg:  "10px",
        xl:  "14px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
