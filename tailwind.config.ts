import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "old-blue": {
          50: "#E8ECF1",
          100: "#C5D0E8",
          200: "#8AA8D4",
          300: "#4A7CBF",
          400: "#0055AA",
          500: "#003399",
          600: "#002277",
          700: "#001155",
          800: "#000833",
          900: "#000422",
          DEFAULT: "#003399",
        },
        "old-yellow": {
          50: "#FFF9E6",
          100: "#FFF0B3",
          200: "#FFE680",
          300: "#FFDB4D",
          400: "#FFD119",
          500: "#FFCC00",
          600: "#CCA300",
          700: "#997A00",
          800: "#665200",
          900: "#332900",
          DEFAULT: "#FFCC00",
        },
        "old-navy": "#000833",
      },
      boxShadow: {
        "box": "3px 3px 0px 0px #000833",
        "box-sm": "2px 2px 0px 0px #000833",
        "box-lg": "5px 5px 0px 0px #000833",
      },
    },
  },
  plugins: [],
};
export default config;
