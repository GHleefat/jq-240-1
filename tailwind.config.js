/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        sakura: {
          50: "#FFF5F7",
          100: "#FFE4EA",
          200: "#FFC9D4",
          300: "#FFB7C5",
          400: "#FF8FA3",
          500: "#FF6B85",
          600: "#E84A6A",
        },
        indigo: {
          DEFAULT: "#2B4C7E",
          light: "#4A6FA5",
          dark: "#1A3354",
        },
        cream: "#FFF8F0",
        gold: "#FFD700",
      },
      fontFamily: {
        jp: ['"Noto Sans JP"', '"Noto Sans SC"', "sans-serif"],
        display: ['"Noto Serif JP"', '"Yu Mincho"', "serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "bounce-in": "bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        "shake": "shake 0.4s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "sakura-fall": "sakuraFall 8s linear infinite",
        "ripple": "ripple 0.6s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-8px)" },
          "40%, 80%": { transform: "translateX(8px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        sakuraFall: {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(360deg)", opacity: "0" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.6" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255, 183, 197, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(255, 183, 197, 0.8)" },
        },
      },
      boxShadow: {
        soft: "0 4px 20px rgba(43, 76, 126, 0.08)",
        card: "0 8px 30px rgba(43, 76, 126, 0.12)",
        button: "0 4px 14px rgba(255, 107, 133, 0.3)",
      },
    },
  },
  plugins: [],
};
