import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  // Optionnel : si tu utilises un lien public via VS Code Tunnels,
  // mets VITE_TUNNEL_HOST="<id>-8080.<region>.devtunnels.ms" dans le .env du FRONT.
  const tunnelHost = process.env.VITE_TUNNEL_HOST;

  return {
    base: "/",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [react(), isDev && componentTagger()].filter(Boolean) as any,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",   // accessible depuis le réseau / VS Code Ports
      port: 8080,
      strictPort: true,
      hmr: tunnelHost
        ? { protocol: "wss", host: tunnelHost, clientPort: 443 }
        : undefined,
    },
    preview: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
    },
  };
});
