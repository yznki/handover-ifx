<script setup lang="ts">
import { computed, ref } from "vue";
import DocsOnThisPage from "~/components/Docs/DocsOnThisPage.vue";
import DocsSidebar from "~/components/Docs/DocsSidebar.vue";
import { calculateReadingTime, findDocumentationSection, sortDocumentationPages, type DocumentationPageMetadata } from "~/utils/documentation";
import { cva } from "class-variance-authority";

/**
 * Nuxt Content table-of-contents link.
 */
interface TableOfContentsLink {
  /**
   * Heading identifier.
   */
  id: string;

  /**
   * Heading text.
   */
  text: string;

  /**
   * Heading depth.
   */
  depth?: number;

  /**
   * Child headings.
   */
  children?: TableOfContentsLink[];
}

/**
 * Nuxt Content page body.
 */
interface DocumentationBody {
  /**
   * Plain text content.
   */
  value?: string;

  /**
   * Table of contents.
   */
  toc?: {
    /**
     * TOC links.
     */
    links?: TableOfContentsLink[];
  };
}

/**
 * Documentation page document.
 */
interface DocumentationPage extends DocumentationPageMetadata {
  /**
   * Renderable content body.
   */
  body?: DocumentationBody;
}

const route = useRoute();
const isSidebarOpen = ref<boolean>(false);
const sectionDotStyle = cva("h-2 w-2 rounded-full", {
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
const path = computed<string>(() => `/docs/${(route.params.slug as string[]).join("/")}`);
const { data: page } = await useAsyncData(`document-${path.value}`, () => queryCollection("documents").path(path.value).first());
const { data: documents } = await useAsyncData("documentation-navigation", () => queryCollection("documents").where("path", "LIKE", "/docs/%").order("order", "ASC").all());
const typedPage = computed<DocumentationPage | null>(() => page.value as DocumentationPage | null);
const navigationDocuments = computed<DocumentationPageMetadata[]>(() => sortDocumentationPages((documents.value || []) as DocumentationPageMetadata[]));
const currentSection = computed(() => findDocumentationSection(typedPage.value?.section));
const currentPageIndex = computed<number>(() => navigationDocuments.value.findIndex((document) => document.path === path.value));
const previousPage = computed<DocumentationPageMetadata | null>(() => currentPageIndex.value > 0 ? navigationDocuments.value[currentPageIndex.value - 1] || null : null);
const nextPage = computed<DocumentationPageMetadata | null>(() => currentPageIndex.value >= 0 ? navigationDocuments.value[currentPageIndex.value + 1] || null : null);
const tableOfContentsLinks = computed<TableOfContentsLink[]>(() => typedPage.value?.body?.toc?.links || []);
const readingTime = computed<string>(() => calculateReadingTime(typedPage.value?.body?.value || typedPage.value?.description || ""));

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
  <main class="mx-auto grid max-w-[1760px] gap-8 px-4 pb-20 pt-24 sm:px-6 xl:grid-cols-[18rem_minmax(0,760px)_17rem]">
    <DocsSidebar :pages="navigationDocuments" :current-path="path" :open="isSidebarOpen" @close="closeSidebar" />

    <section class="min-w-0">
      <button class="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/55 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted shadow-sm xl:hidden" type="button" @click="openSidebar">
        Browse docs
      </button>

      <article v-if="typedPage" class="min-w-0">
        <nav class="mb-4 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink/45" aria-label="Breadcrumb">
          <NuxtLink class="transition hover:text-violet-700" to="/docs">Explore</NuxtLink>
          <span>/</span>
          <span :class="sectionDotStyle({ section: currentSection.identifier })" />
          <span>{{ currentSection.label }}</span>
        </nav>

        <header class="mb-10 border-b border-ink/10 pb-8">
          <h1 class="max-w-[12ch] text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink">{{ typedPage.title }}</h1>
          <p v-if="typedPage.description" class="mt-4 max-w-[68ch] text-lg leading-8 text-muted">{{ typedPage.description }}</p>
        </header>

        <div class="content-prose max-w-[72ch]">
          <ContentRenderer :value="typedPage" />
        </div>

        <nav class="mt-14 grid gap-3 border-t border-ink/10 pt-6 sm:grid-cols-2" aria-label="Previous and next pages">
          <NuxtLink v-if="previousPage" :to="previousPage.path" class="group rounded-2xl border border-ink/10 bg-white/35 p-4 transition hover:border-violet-300 hover:bg-violet-50">
            <span class="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink/40">Previous</span>
            <span class="mt-2 block font-semibold tracking-[-0.01em] text-ink group-hover:text-violet-700">{{ previousPage.title }}</span>
          </NuxtLink>
          <div v-else />
          <NuxtLink v-if="nextPage" :to="nextPage.path" class="group rounded-2xl border border-ink/10 bg-white/35 p-4 text-right transition hover:border-violet-300 hover:bg-violet-50">
            <span class="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink/40">Next</span>
            <span class="mt-2 block font-semibold tracking-[-0.01em] text-ink group-hover:text-violet-700">{{ nextPage.title }}</span>
          </NuxtLink>
        </nav>
      </article>

      <article v-else class="max-w-[720px] border-y border-ink/10 py-16">
        <h1 class="text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-[-0.02em]">Page not found.</h1>
        <NuxtLink class="mt-6 inline-flex rounded-full border border-ink/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-violet-700" to="/docs">Back to Explore</NuxtLink>
      </article>
    </section>

    <DocsOnThisPage :links="tableOfContentsLinks" :reading-time="readingTime" :owner="typedPage?.owner" :updated="typedPage?.updated" />
  </main>
</template>
