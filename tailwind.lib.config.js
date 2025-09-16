import { defineConfig } from "@tailwindcss/vite";

export default defineConfig({
  // Only scan component files for library build
  content: ["./src/components/**/*.{js,ts,jsx,tsx}"],
});
