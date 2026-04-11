import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        "package-in": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "package-glow": {
          "0%, 100%": { boxShadow: "0 12px 40px rgba(100, 211, 138, 0.12)" },
          "50%": { boxShadow: "0 16px 48px rgba(100, 211, 138, 0.22)" }
        }
      },
      animation: {
        "package-in": "package-in 0.55s ease-out forwards",
        "package-glow": "package-glow 3.5s ease-in-out infinite",
        "package-feature":
          "package-in 0.55s ease-out forwards, package-glow 3.5s ease-in-out 0.65s infinite"
      },
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
