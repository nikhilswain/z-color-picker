import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLibrary = mode === "library";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: isLibrary
      ? {
          lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ZColorPicker",
            fileName: "z-color-picker",
            formats: ["es", "umd"],
          },
          rollupOptions: {
            external: ["react", "react-dom"],
            output: {
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
              },
              exports: "named",
            },
          },
          sourcemap: true,
          emptyOutDir: false, // Don't empty so we can keep our optimized CSS
          cssCodeSplit: false,
        }
      : undefined,
  };
});
