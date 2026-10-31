import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 5173,
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:8080/vr",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
});