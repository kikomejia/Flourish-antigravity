import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cardBg: "var(--card-bg)",
        cardBorder: "var(--card-border)",
        inputBg: "var(--input-bg)",
        accent: "var(--accent)",
        subText: "var(--sub-text)",
        mutedText: "var(--muted-text)",
      },
      fontFamily: {
        sans: ["var(--font-recoleta)", "sans-serif"],
        serif: ["var(--font-recoleta)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
