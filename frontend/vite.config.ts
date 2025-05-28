import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// export default defineConfig({
//   server: {
//     host: "::",
//     port: 8080,
//     fs: {
//       strict: true,
//       allow: [path.resolve(__dirname)], // ✅ Only allow current project folder
//     },
//   },
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });


export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    allowedHosts: [
      'sb.tamimulahsan.com', // Replace with your domain
      '0.0.0.0',
      '127.0.0.1',      // Local IP (optional)
    ],
    port: 8080,
    fs: {
      strict: true,
      allow: [path.resolve(__dirname)],
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
