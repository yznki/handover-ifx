<script setup lang="ts">
import { cva } from "class-variance-authority";
import { computed } from "vue";
import { documentationSections, findDocumentationSection, sortDocumentationPages, type DocumentationPageMetadata, type DocumentationSectionIdentifier } from "~/utils/documentation";

/**
 * Sidebar properties.
 */
interface DocsSidebarProperties {
  /**
   * Documentation pages.
   */
  pages: DocumentationPageMetadata[];

  /**
   * Current page path.
   */
  currentPath?: string;

  /**
   * Whether the mobile drawer is open.
   */
  open?: boolean;
}

/**
 * Sidebar events.
 */
interface DocsSidebarEmits {
  /**
   * Closes the mobile drawer.
   */
  close: [];
}

const properties = withDefaults(defineProps<DocsSidebarProperties>(), {
  currentPath: "",
  open: false
});
const emit = defineEmits<DocsSidebarEmits>();

const drawerStyle = cva("fixed inset-y-0 left-0 z-[70] w-[min(88vw,22rem)] border-r border-ink/10 bg-paper/95 px-4 pb-8 pt-24 shadow-2xl backdrop-blur-xl transition xl:hidden", {
  variants: {
    open: {
      true: "translate-x-0",
      false: "pointer-events-none -translate-x-full"
    }
  }
});
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
const navigationLinkStyle = cva("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm leading-5 text-muted transition hover:bg-ink/[0.035] hover:text-ink", {
  variants: {
    active: {
      true: "bg-violet-50 text-ink shadow-[inset_3px_0_0_#6D3BFF]",
      false: ""
    }
  }
});
const groupedPages = computed<Record<DocumentationSectionIdentifier, DocumentationPageMetadata[]>>(() => {
  const groupedDocumentationPages = {
    start: [],
    aida: [],
    cvc: [],
    valibridge: [],
    reference: []
  } as Record<DocumentationSectionIdentifier, DocumentationPageMetadata[]>;

  sortDocumentationPages(properties.pages).forEach((page) => {
    const section = findDocumentationSection(page.section).identifier;
    groupedDocumentationPages[section].push(page);
  });

  return groupedDocumentationPages;
});
const resolvedDrawerStyle = computed<string>(() => drawerStyle({ open: properties.open }));

/**
 * Emits close after a mobile navigation item is selected.
 */
function closeDrawer(): void {
  emit("close");
}
</script>

<template>
  <aside class="hidden xl:block">
    <nav class="sticky top-20 max-h-[calc(100svh-5rem)] overflow-y-auto border-r border-ink/10 pr-5">
      <NuxtLink to="/docs" class="mb-6 flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/45 px-4 py-3 text-sm font-semibold tracking-[-0.01em] text-ink transition hover:border-violet-300 hover:bg-violet-50">
        <span class="grid h-8 w-8 place-items-center rounded-xl bg-ink text-xs text-paper">↗</span>
        Explore index
      </NuxtLink>
      <section v-for="section in documentationSections" :key="section.identifier" class="mb-7">
        <p class="mb-2 flex items-center gap-2 px-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/45">
          <span :class="sectionDotStyle({ section: section.identifier })" />
          {{ section.label }}
        </p>
        <NuxtLink v-for="page in groupedPages[section.identifier]" :key="page.path" :to="page.path" :class="navigationLinkStyle({ active: page.path === currentPath })">
          <span class="min-w-0 flex-1">{{ page.title }}</span>
        </NuxtLink>
      </section>
    </nav>
  </aside>

  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[65] bg-ink/20 backdrop-blur-sm xl:hidden" @click="closeDrawer" />
    <nav :class="resolvedDrawerStyle" aria-label="Documentation drawer">
      <div class="mb-5 flex items-center justify-between">
        <p class="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-violet-700">Explore</p>
        <button class="rounded-full border border-ink/10 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em]" type="button" @click="closeDrawer">
          Close
        </button>
      </div>
      <NuxtLink to="/docs" class="mb-5 block rounded-2xl border border-ink/10 bg-white/55 px-4 py-3 text-sm font-semibold" @click="closeDrawer">
        Explore index
      </NuxtLink>
      <section v-for="section in documentationSections" :key="section.identifier" class="mb-6">
        <p class="mb-2 flex items-center gap-2 px-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/45">
          <span :class="sectionDotStyle({ section: section.identifier })" />
          {{ section.label }}
        </p>
        <NuxtLink v-for="page in groupedPages[section.identifier]" :key="page.path" :to="page.path" :class="navigationLinkStyle({ active: page.path === currentPath })" @click="closeDrawer">
          {{ page.title }}
        </NuxtLink>
      </section>
    </nav>
  </Teleport>
</template>
