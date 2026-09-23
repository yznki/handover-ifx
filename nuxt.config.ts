import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2026-09-23",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss", "@nuxt/fonts", "@tresjs/nuxt", "lenis/nuxt"],
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Geist", provider: "google", weights: ["400", "500", "600", "700", "800", "900"] },
      { name: "Geist Mono", provider: "google", weights: ["400", "500", "600", "700"] },
      { name: "Caveat", provider: "google", weights: ["500", "600", "700"] }
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
        { name: "description", content: "A cinematic, content-editable handover for AIDA, CVC, ValiBridge, CI/CD, access, and unfinished work." },
        { name: "theme-color", content: "#F6F4EF" }
      ]
    }
  },
  typescript: {
    typeCheck: true,
    strict: true
  }
});
