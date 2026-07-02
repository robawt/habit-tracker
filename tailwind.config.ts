import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "xp-blue": {
          50: "#E8F0FE",
          100: "#C5D9F2",
          200: "#8AB4F8",
          300: "#4A8FF5",
          400: "#1A6DF0",
          500: "#0055E5",
          600: "#0044B8",
          700: "#00338A",
          800: "#00225C",
          900: "#00112E",
          DEFAULT: "#0055E5",
        },
        "xp-teal": "#3A6EA5",
        "xp-green": {
          50: "#E8F5EC",
          100: "#C8E6D2",
          200: "#A5D6B7",
          300: "#6BC48D",
          400: "#43A66C",
          500: "#2E8B57",
          600: "#1E6B3E",
          700: "#13522E",
          800: "#0A3A1F",
          900: "#052511",
          DEFAULT: "#2E8B57",
        },
        "xp-silver": {
          50: "#FBF9F5",
          100: "#F5F3ED",
          200: "#ECE9D8",
          300: "#E0DAC8",
          400: "#D4C8B8",
          500: "#C0B8A8",
          600: "#A09888",
          700: "#807868",
          800: "#605848",
          900: "#403838",
          DEFAULT: "#ECE9D8",
        },
        "xp-gold": "#FFCC00",
        "web-bg": "#C0C0C0",
        "retro-magenta": "#FF00FF",
        "retro-lime": "#00FF00",
        "retro-cyan": "#00CCFF",
      },
      fontFamily: {
        heading: ['"Trebuchet MS"', '"Lucida Sans Unicode"', "sans-serif"],
        body: ["Tahoma", "Geneva", "Verdana", "sans-serif"],
        mono: ['"Courier New"', '"Lucida Console"', "monospace"],
      },
      boxShadow: {
        "xp-raised": "1px 1px 0px 0px #FFFFFF, -1px -1px 0px 0px #808080",
        "xp-raised-sm": "1px 1px 0px 0px #FFFFFF, -1px -1px 0px 0px #A0A0A0",
        "xp-sunken": "inset 1px 1px 0px 0px #808080, inset -1px -1px 0px 0px #FFFFFF",
        "xp-window": "2px 2px 0px 0px #404040",
      },
    },
  },
  plugins: [],
};
export default config;
