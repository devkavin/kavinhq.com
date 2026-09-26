import animate from "tailwindcss-animate";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070A",
        panel: "#0B0F17",
        accent: "#00F0FF",
        mint: "#00FF87",
      },
      fontFamily: {
        display: ['"Clash Display"', "sans-serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: { marquee: "marquee 48s linear infinite" },
    },
  },
  plugins: [animate],
};
