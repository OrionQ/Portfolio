// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: 'https://xiaoleiqin.com',
  base: '',
  server: {
    host: true,
  },
  integrations: [
    react({ experimentalReactChildren: true }),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow Cloudflare quick tunnels (and similar) for phone previews
      allowedHosts: true,
    },
  },
});
