import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dp: {
          bg: "var(--dp-bg)",
          surface: "var(--dp-surface)",
          card: "var(--dp-card)",
          accent: "var(--dp-accent)",
          muted: "var(--dp-muted)",
        },
      },
      borderColor: {
        dp: "var(--dp-border)",
        "dp-strong": "var(--dp-border-strong)",
        "dp-subtle": "var(--dp-border-subtle)",
      },
      ringColor: {
        dp: "var(--dp-ring)",
      },
      boxShadow: {
        "dp-elevated": "var(--dp-shadow-elevated)",
      },
    },
  },
  plugins: [],
} satisfies Config;
