import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
const projectRoot = path.resolve(__dirname);

export default defineConfig({
  root: projectRoot,
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: path.resolve(projectRoot, "tailwind.config.js"),
        }),
        autoprefixer(),
      ],
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(projectRoot, "index.html"),
        panel: path.resolve(projectRoot, "panel.html"),
        background: path.resolve(projectRoot, "src/background.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "background.js";
          }
          return "[name].js";
        },
      },
    },
  },
});
