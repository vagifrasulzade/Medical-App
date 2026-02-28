/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary:       "#3D5AFE",
        "primary-dark":  "#2A47E8",
        "primary-light": "#E8ECFF",
        "text-dark":     "#1A1A2E",
        "text-gray":     "#8A8A9B",
        "dot-inactive":  "#D0D0D0",
        "card-bg":       "#F5F7FA",
      },
    },
  },
  plugins: [],
}