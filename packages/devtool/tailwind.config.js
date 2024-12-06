/** @type {import('tailwindcss').Config} */
import path from "path";
const projectRoot = path.resolve(__dirname);

export default {
  content: [
    path.resolve(projectRoot, "panel.html"),
    path.resolve(projectRoot, "index.html"),
    path.resolve(projectRoot, "src/**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
