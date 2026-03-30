export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "typing-dot-bounce": {
          "0%,40%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(-0.25rem)" },
        },
      },
      animation: {
        "typing-dot-bounce": "typing-dot-bounce 1.25s ease-out infinite",
      },
    },
  },
};
