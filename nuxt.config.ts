import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2026-09-23",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss", "@nuxt/fonts"],
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Geist", provider: "google", weights: ["400", "500", "600", "700", "800", "900"] },
      { name: "Geist Mono", provider: "google", weights: ["400", "500", "600", "700"] },
      { name: "Caveat", provider: "google", weights: ["500", "600", "700"] },
      { name: "Bricolage Grotesque", provider: "google", weights: ["700", "800"] }
    ]
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/", "/checklist", "/docs/aida-architecture", "/docs/cicd-aida", "/docs/cvc-now-and-next"]
    }
  },
  app: {
    head: {
      title: "Yazan Kiswani — Infineon Handover",
      meta: [
        { name: "description", content: "A playful landing page for Yazan Kiswani's Infineon handover." },
        { name: "theme-color", content: "#7C3AED" }
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", sizes: "32x32", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }
      ]
    }
  },
  typescript: {
    typeCheck: true,
    strict: true
  }
});
