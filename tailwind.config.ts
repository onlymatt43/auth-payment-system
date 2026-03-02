import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neon: {
          yellow: "#FFFF00",
          pink: "#FF006E",
          blue: "#00D9FF",
          purple: "#B500FF",
        },
        dark: {
          navy: "#0a0e27",
          blue: "#1a1f3a",
          darker: "#050710",
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(255, 255, 0, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)",
        "neon-blue": "0 0 20px rgba(0, 217, 255, 0.5), 0 0 40px rgba(0, 217, 255, 0.2)",
        "neon-pink": "0 0 20px rgba(255, 0, 110, 0.6), 0 0 40px rgba(255, 0, 110, 0.2)",
      },
      borderRadius: {
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
