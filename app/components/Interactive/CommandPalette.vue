<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { cva } from "class-variance-authority";

/**
 * A searchable content section.
 */
interface SearchSection {
  /**
   * Unique section identifier.
   */
  id: string;

  /**
   * Section title.
   */
  title: string;

  /**
   * Section content text.
   */
  content: string;

}

const isOpen = ref<boolean>(false);
const searchTerm = ref<string>("");
const { data: sections } = await useAsyncData("command-palette-search", () => queryCollectionSearchSections("documents"));

const paletteStyle = cva("fixed inset-0 z-[90] grid place-items-start bg-ink/20 px-4 pt-24 backdrop-blur-sm transition", {
  variants: {
    open: {
      true: "opacity-100",
      false: "pointer-events-none opacity-0"
    }
  }
});

const resolvedPaletteStyle = computed<string>(() => paletteStyle({ open: isOpen.value }));
const normalizedSearchTerm = computed<string>(() => searchTerm.value.trim().toLowerCase());
const availableSections = computed<SearchSection[]>(() => (sections.value || []));
const filteredSections = computed<SearchSection[]>(() => {
  if (normalizedSearchTerm.value.length === 0) return availableSections.value.slice(0, 8);
  return availableSections.value.filter((section) => {
    const haystack = `${section.title} ${section.content} ${section.id}`.toLowerCase();
    return haystack.includes(normalizedSearchTerm.value);
  }).slice(0, 8);
});

/**
 * Opens the command palette.
 */
function openPalette(): void {
  isOpen.value = true;
}

/**
 * Closes the command palette.
 */
function closePalette(): void {
  isOpen.value = false;
  searchTerm.value = "";
}

/**
 * Handles global keyboard shortcuts.
 * @param event - The keyboard event.
 */
function handleKeydown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openPalette();
  }

  if (event.key === "Escape") {
    closePalette();
  }
}

/**
 * Navigates to a selected section.
 * @param path - The content path to open.
 */
async function selectSection(sectionIdentifier: string): Promise<void> {
  const targetPath = sectionIdentifier.split("#")[0] || "/";
  await navigateTo(targetPath);
  closePalette();
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  document.querySelectorAll("[data-command-palette-trigger]").forEach((element) => {
    element.addEventListener("click", openPalette);
  });
});
</script>

<template>
  <div :class="resolvedPaletteStyle" @click.self="closePalette">
    <section class="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-ink/10 bg-paper shadow-editorial">
      <div class="border-b border-ink/10 p-4">
        <label class="sr-only" for="command-search">Search handover content</label>
        <input id="command-search" v-model="searchTerm" class="w-full bg-transparent font-mono text-sm uppercase tracking-[0.16em] outline-none placeholder:text-muted" placeholder="Search AIDA, CVC, CI/CD, people..." />
      </div>
      <div class="max-h-[60vh] overflow-y-auto p-2">
        <button v-for="section in filteredSections" :key="section.id" class="group grid w-full gap-2 rounded-[1.4rem] p-4 text-left transition hover:bg-violet-50" @click="selectSection(section.id)">
          <span class="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-violet-700">{{ section.id }}</span>
          <span class="text-xl font-semibold tracking-[-0.04em] text-ink">{{ section.title }}</span>
          <span class="line-clamp-2 text-sm leading-6 text-muted">{{ section.content }}</span>
        </button>
        <p v-if="filteredSections.length === 0" class="p-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">No matching page.</p>
      </div>
    </section>
  </div>
</template>

