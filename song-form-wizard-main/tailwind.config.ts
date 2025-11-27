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
        music: {
          primary: "hsl(var(--music-primary))",
          secondary: "hsl(var(--music-secondary))",
          accent: "hsl(var(--music-accent))",
          "bg-subtle": "hsl(var(--music-bg-subtle))",
        },
        // Design.json color system
        shell: {
          bg: "hsla(var(--shell-bg) / var(--shell-bg-opacity))",
          border: "hsla(var(--shell-border) / var(--shell-border-opacity))",
        },
        chip: {
          bg: "hsla(var(--chip-bg) / var(--chip-bg-opacity))",
          border: "hsla(var(--chip-border) / var(--chip-border-opacity))",
          "hover-bg": "hsla(var(--chip-hover-bg) / var(--chip-hover-bg-opacity))",
        },
        nav: {
          bg: "hsla(var(--nav-bg) / var(--nav-bg-opacity))",
          border: "hsla(var(--nav-border) / var(--nav-border-opacity))",
          "badge-bg": "hsla(var(--nav-badge-bg) / var(--nav-badge-bg-opacity))",
          "badge-text": "hsl(var(--nav-badge-text))",
        },
        cta: {
          bg: "hsl(var(--cta-bg))",
          text: "hsl(var(--cta-text))",
          "hover-bg": "hsl(var(--cta-hover-bg))",
        },
        pill: {
          bg: "hsla(var(--pill-bg) / var(--pill-bg-opacity))",
          border: "hsla(var(--pill-border) / var(--pill-border-opacity))",
          text: "hsl(var(--pill-text))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "shell": "var(--shell-radius)",
        "navbar": "var(--navbar-radius)",
        "search": "var(--search-radius)",
        "btn": "var(--btn-radius)",
        "chip": "var(--chip-radius)",
      },
      fontFamily: {
        sans: ["var(--font-family-main)"],
      },
      fontSize: {
        "headline": "var(--text-headline-size)",
        "sub": "var(--text-sub-size)",
        "nav": "var(--text-nav-size)",
        "input": "var(--text-input-size)",
        "chip": "var(--text-chip-size)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
