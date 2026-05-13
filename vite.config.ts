import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, rootDir, "");
  // Client bundle: only VITE_* is exposed on import.meta.env. Many users set GEMINI_API_KEY
  // without the prefix — read both here and inject via define.
  const geminiKey =
    fileEnv.VITE_GEMINI_API_KEY ||
    fileEnv.GEMINI_API_KEY ||
    "";

  return {
    envDir: rootDir,
    server: {
      host: "localhost",
      port: 8080,
      hmr: {
        overlay: true,
      },
    },
    plugins: [react()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
      },
    },
    // Injected at build/dev time from .env (loadEnv). Use a dedicated symbol — overriding
    // import.meta.env.VITE_* via define can be overwritten by Vite's env plugin.
    define: {
      __CYNDA_GEMINI_KEY__: JSON.stringify(geminiKey),
    },
  };
});
