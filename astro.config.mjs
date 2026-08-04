import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

const site = "https://c2go.buymecompile.top";

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      // `/` is a noindex browser-language router. The localized pages are the
      // canonical, indexable landing pages.
      filter: (page) => page !== `${site}/`,
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en",
          "zh-cn": "zh-CN",
        },
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark-default",
      },
      wrap: true,
    },
  },
  vite: {
    build: {
      cssMinify: "lightningcss",
    },
  },
});
