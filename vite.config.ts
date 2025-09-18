import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isLibrary = mode === "library";

  return {
    plugins: [react()],
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
            external: ["react", "react-dom", "react/jsx-runtime"],
            output: {
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
                "react/jsx-runtime": "React",
              },
              exports: "named",
            },
          },
          sourcemap: true,
          emptyOutDir: false, // Don't empty so we can keep our optimized CSS
          cssCodeSplit: false,
          target: "esnext",
        }
      : undefined,
    define: isLibrary
      ? {
          "process.env.NODE_ENV": '"production"',
          __DEV__: false,
          __REACT_DEVTOOLS_GLOBAL_HOOK__: "undefined",
        }
      : undefined,
  };
});
