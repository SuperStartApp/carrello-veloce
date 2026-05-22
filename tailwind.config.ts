import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.{js,ts,jsx,tsx,mdx}", // Cerca anche nella cartella principale
  ],
  theme: {
    extend: {
      colors: {
        vinciguerra: {
          gold: "#ad9263",
          dark: "#333333",
        },
      },
    },
  },
  plugins: [],
};
export default config;