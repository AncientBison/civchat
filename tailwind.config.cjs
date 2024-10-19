import {nextui} from "@nextui-org/theme"
import tailwindScrollbar from "tailwind-scrollbar";

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      dark: {
        extend: "dark",
        colors: {
          danger: {
            DEFAULT: "#A62D24",
          },
        },
      },
      light: {
        extend: "light",
        colors: {
          danger: {
            DEFAULT: "#E04343",
          },
        },
      }
    }
  }), tailwindScrollbar({ nocompatible: true, preferredStrategy: 'pseudoelements' })],
}
