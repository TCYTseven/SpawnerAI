import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        primary: {
          DEFAULT: "#ff7a00",
          foreground: "#ffffff",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          primary: {
            DEFAULT: "#ff7a00",
            foreground: "#ffffff",
          },
          background: "#0d0d0d",
          foreground: "#ffffff",
          default: {
            DEFAULT: "#1a1a1a",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
}

module.exports = config;