import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / 0.12)",
        input: "rgb(var(--input) / 0.14)",
        ring: "rgb(var(--ring) / 0.4)",
        chart: {
          "1": "rgb(var(--chart-1) / <alpha-value>)",
          "2": "rgb(var(--chart-2) / <alpha-value>)",
          "3": "rgb(var(--chart-3) / <alpha-value>)",
          "4": "rgb(var(--chart-4) / <alpha-value>)",
          "5": "rgb(var(--chart-5) / <alpha-value>)",
        },
        brand: {
          turquoise: "rgb(var(--brand-turquoise) / <alpha-value>)",
          "turquoise-soft": "rgb(var(--brand-turquoise-soft) / <alpha-value>)",
          red: "rgb(var(--brand-red) / <alpha-value>)",
          "red-soft": "rgb(var(--brand-red-soft) / <alpha-value>)",
          purple: "rgb(var(--brand-purple) / <alpha-value>)",
          "purple-soft": "rgb(var(--brand-purple-soft) / <alpha-value>)",
          gray: "rgb(var(--brand-gray) / <alpha-value>)",
          "gray-soft": "rgb(var(--brand-gray-soft) / <alpha-value>)",
          coral: "rgb(var(--brand-coral) / <alpha-value>)",
          teal: "rgb(var(--brand-teal) / <alpha-value>)",
          green: "rgb(var(--brand-green) / <alpha-value>)",
          "green-soft": "rgb(var(--brand-green-soft) / <alpha-value>)",
          yellow: "rgb(var(--brand-yellow) / <alpha-value>)",
          "yellow-soft": "rgb(var(--brand-yellow-soft) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
