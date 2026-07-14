import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#D37506",
          orangeDark: "#b86705",
          cream: "#f8ead9",
          ink: "#050505",
          charcoal: "#161616",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Montserrat", "sans-serif"],
        body: ["var(--font-body)", "Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
