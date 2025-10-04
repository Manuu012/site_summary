import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Your GitHub repository name
  build: {
    outDir: "dist",
    // Ensure proper paths in built files
  },
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
      "https://site-summary.onrender.com/api"
    ),
  },
});
