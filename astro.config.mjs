// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  build: {
    assetsPrefix: '/assets/',
  },
  site: 'https://orionq.github.io',
  base: '',
  integrations: [
    tailwind(),
    react({ experimentalReactChildren: true }),
    icon(),
  ],
});
