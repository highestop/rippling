/** @type {import('tailwindcss').Config} */
const projectRoot = "packages/devtool";

export default {
  content: [
    projectRoot + "/panel.html",
    projectRoot + "/index.html",
    projectRoot + "/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
