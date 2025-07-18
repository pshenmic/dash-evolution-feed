import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  mode: "development",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    sourcemap: false,
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true
    },
    minify: false
  },
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: false,
    keepNames: true,
    treeShaking: false
  },
});
