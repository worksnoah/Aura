import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const repoName = "aura";

export default defineConfig({
  base: "/aura/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "Aura",
        short_name: "Aura",
        description: "Aura - a fullscreen ambient Spotify now-playing display with synced lyrics.",
        theme_color: "#09090d",
        background_color: "#09090d",
        display: "fullscreen",
        display_override: ["window-controls-overlay"],
        start_url: "/aura/",
        scope: "/aura/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
