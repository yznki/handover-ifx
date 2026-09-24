<script setup lang="ts">
import DocsSidebar from "~/components/Docs/DocsSidebar.vue";
import { documentationSections, sortDocumentationPages, type DocumentationPageMetadata } from "~/utils/documentation";
import { cva } from "class-variance-authority";

const isSidebarOpen = ref<boolean>(false);
const sectionDotStyle = cva("h-2.5 w-2.5 rounded-full", {
  variants: {
    section: {
      start: "bg-violet-500",
      aida: "bg-blue-500",
      cvc: "bg-emerald-500",
      valibridge: "bg-amber-500",
      reference: "bg-slate-500"
    }
  }
});
const { data: documents } = await useAsyncData("documentation-index", () => queryCollection("documents").where("path", "LIKE", "/docs/%").order("order", "ASC").all());
const navigationDocuments = computed<DocumentationPageMetadata[]>(() => sortDocumentationPages((documents.value || []) as DocumentationPageMetadata[]));
const sectionCards = computed(() => documentationSections.map((section) => ({
  ...section,
  pages: navigationDocuments.value.filter((page) => page.section === section.identifier)
})));

/**
 * Opens the mobile sidebar drawer.
 */
function openSidebar(): void {
  isSidebarOpen.value = true;
}

/**
 * Closes the mobile sidebar drawer.
 */
function closeSidebar(): void {
  isSidebarOpen.value = false;
}
</script>

<template>
  <main class="mx-auto grid max-w-[1680px] gap-5 px-3 pb-16 pt-20 sm:px-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
    <DocsSidebar :pages="navigationDocuments" current-path="/docs" :open="isSidebarOpen" @close="closeSidebar" />

    <section class="mx-auto w-full max-w-[980px] min-w-0">
      <button class="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface/55 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted shadow-sm lg:hidden" type="button" @click="openSidebar">
        Browse docs
      </button>

      <header class="mb-8 border-b border-ink/10 pb-6">
        <p class="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-violet-700">Explore mode</p>
        <h1 class="max-w-[14ch] text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-ink">The grown-up handover lives here.</h1>
        <p class="mt-4 max-w-[62ch] text-lg leading-8 text-muted">Start with the operating model, then jump into the AIDA, CVC, ValiBridge, access, and runbook pages as needed.</p>
      </header>

      <NuxtLink to="/docs/how-my-mind-works" class="group mb-5 grid rounded-3xl border border-violet-300 bg-violet-50/80 p-6 transition hover:-translate-y-0.5 hover:bg-violet-50 md:grid-cols-[1fr_auto] md:items-end">
        <span>
          <span class="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-violet-700">Start here</span>
          <span class="mt-3 block text-2xl font-semibold tracking-[-0.02em] text-ink">How my mind works</span>
          <span class="mt-2 block max-w-[62ch] text-muted">The shortest path to understanding how to decide, debug, use AI, and know when a handover item is safe.</span>
        </span>
        <span class="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-violet-700 md:mt-0">Open →</span>
      </NuxtLink>

      <div class="grid gap-4 md:grid-cols-2">
        <NuxtLink v-for="section in sectionCards" :key="section.identifier" :to="section.pages[0]?.path || '/docs'" class="group rounded-3xl border border-ink/10 bg-surface/35 p-5 transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-surface/60">
          <div class="mb-4 flex items-center justify-between">
            <span :class="sectionDotStyle({ section: section.identifier })" />
            <span class="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink/40">{{ section.pages.length }} {{ section.pages.length === 1 ? "page" : "pages" }}</span>
          </div>
          <h2 class="text-xl font-semibold tracking-[-0.02em] text-ink">{{ section.label }}</h2>
          <p class="mt-2 min-h-14 text-sm leading-6 text-muted">{{ section.description }}</p>
          <span class="mt-5 inline-flex font-mono text-[0.68rem] uppercase tracking-[0.18em] text-violet-700">Browse section →</span>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
