import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Keben Driver Report",
        short_name: "Keben Report",
        description: "Delivery report management for Keben Hardware drivers",
        theme_color: "#2D5016",
        background_color: "#FAFAFA",
        display: "standalone",
icons: [
  {
    src: "/icon-192x192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/icon-512x512.png",
    sizes: "512x512",
    type: "image/png",
  },
],

      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.emailjs\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "emailjs-cache",
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
