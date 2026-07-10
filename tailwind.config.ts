import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14211B",
        paper: "#F7F8F3",
        moss: "#176B4D",
        jade: "#37A675",
        coral: "#F36B4F",
        sand: "#E9E4D8",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(20, 33, 27, 0.10)",
        card: "0 8px 30px rgba(20, 33, 27, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
