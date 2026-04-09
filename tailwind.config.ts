import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // ── metaMe Parchment Intelligence Semantic Tokens ──
        mm: {
          canvas: {
            base: "var(--mm-canvas-base)",
            variant: "var(--mm-canvas-variant)",
            deep: "var(--mm-canvas-deep)",
          },
          surface: {
            1: "var(--mm-surface-1)",
            2: "var(--mm-surface-2)",
            3: "var(--mm-surface-3)",
            4: "var(--mm-surface-4)",
          },
          ink: {
            primary: "var(--mm-ink-primary)",
            secondary: "var(--mm-ink-secondary)",
            muted: "var(--mm-ink-muted)",
            faint: "var(--mm-ink-faint)",
            inverse: "var(--mm-ink-inverse)",
          },
          line: {
            subtle: "var(--mm-line-subtle)",
            soft: "var(--mm-line-soft)",
            medium: "var(--mm-line-medium)",
            strong: "var(--mm-line-strong)",
          },
          accent: {
            runtime: "var(--mm-accent-runtime)",
            codex: "var(--mm-accent-codex)",
            make: "var(--mm-accent-make)",
            earn: "var(--mm-accent-earn)",
            share: "var(--mm-accent-share)",
            alert: "var(--mm-accent-alert)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "mm-xs": "var(--mm-radius-xs)",
        "mm-sm": "var(--mm-radius-sm)",
        "mm-md": "var(--mm-radius-md)",
        "mm-lg": "var(--mm-radius-lg)",
      },
      boxShadow: {
        "mm-low": "var(--mm-shadow-low)",
        "mm-mid": "var(--mm-shadow-mid)",
        "mm-panel": "var(--mm-shadow-panel)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "dot-wave": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.4)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "dot-wave": "dot-wave 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
