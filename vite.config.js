import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" => Vercel aur GitHub Pages dono par chalta hai
export default defineConfig({
  base: "./",
  plugins: [react()],
});
