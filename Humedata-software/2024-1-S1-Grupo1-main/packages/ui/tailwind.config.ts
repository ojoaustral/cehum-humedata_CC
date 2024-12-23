import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.tsx"],
  darkMode: ["class"],
  variants: {
    extend: {
      opacity: ["group-hover"],
      display: ["group-hover"],
    },
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: "#93c020",
        secondary: "#008cc0",
        "blue": "#008cc0",
        "red-area": "#f4cccc",
        "yellow-area": "#fff2cc",
        "green-area": "#d9ead3",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin": "spin 1s linear infinite",
      },
      width: {
        collage: "clamp(900px, 75vw, 1200px)",
      }
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config
