import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080B0D",
        panel: "#11161B",
        accent: "#64D38A",
        accentSoft: "#2B8A5B"
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(180deg, rgba(8,11,13,0.45) 0%, rgba(8,11,13,0.85) 100%)"
      }
    }
  },
  plugins: []
};

export default config;
