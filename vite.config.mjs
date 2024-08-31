// Plugins
import Components from "unplugin-vue-components/vite";
import Vue from "@vitejs/plugin-vue";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import ViteFonts from "unplugin-fonts/vite";

// Utilities
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

import dotenv from "dotenv";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify(),
    Components(),
    ViteFonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
  ],
  define: {
    "process.env": {
      VITE_GOOGLE_MAPS_API_KEY: dotenv.config().parsed.VITE_GOOGLE_MAPS_API_KEY,
      VITE_GOOGLE_MAPS_BASE_URI:
        dotenv.config().parsed.VITE_GOOGLE_MAPS_BASE_URI,
      VITE_REST_COUNTRIES_BASE_URI:
        dotenv.config().parsed.VITE_REST_COUNTRIES_BASE_URI,
      VITE_OPEN_STREET_BASE_URI:
        dotenv.config().parsed.VITE_OPEN_STREET_BASE_URI,
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
  },
});
