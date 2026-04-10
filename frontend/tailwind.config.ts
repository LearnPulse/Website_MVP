import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        primary:  "#1D9E75",
        canvas:   "#141414",
        surface:  "#1e1e21",
        surface2: "#252528",
        line:     "#2d2d32",
        ink:      "#f0f0f0",
        dim:      "#88889a",
        ghost:    "#242428",
      },
      fontSize: {
        "2xs": ["0.7rem",    { lineHeight: "1.3rem"  }],
        xs:    ["0.8125rem", { lineHeight: "1.4rem"  }],
        sm:    ["0.9rem",    { lineHeight: "1.55rem" }],
        base:  ["1rem",      { lineHeight: "1.7rem"  }],
        lg:    ["1.125rem",  { lineHeight: "1.75rem" }],
        xl:    ["1.3125rem", { lineHeight: "1.875rem"}],
        "2xl": ["1.625rem",  { lineHeight: "2.1rem"  }],
        "3xl": ["2rem",      { lineHeight: "2.5rem"  }],
        "4xl": ["2.5rem",    { lineHeight: "3rem"    }],
        "5xl": ["3.25rem",   { lineHeight: "1"       }],
      },
      borderRadius: {
        sm:      "6px",
        DEFAULT: "10px",
        md:      "12px",
        lg:      "16px",
        xl:      "20px",
        "2xl":   "28px",
        full:    "9999px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0,0,0,.4), 0 1px 2px -1px rgba(0,0,0,.4)",
        card:   "0 4px 16px 0 rgba(0,0,0,.5)",
      },
    },
  },
  plugins: [],
};

export default config;
