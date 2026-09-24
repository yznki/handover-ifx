<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { cva } from "class-variance-authority";
import { useTheme } from "~/composables/useTheme/useTheme";

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

/**
 * Renderable command palette result.
 */
interface SearchResult {
  /**
   * Stable result identifier.
   */
  id: string;

  /**
   * Result title.
   */
  title: string;

  /**
   * Page or heading path.
   */
  path: string;

  /**
   * Group label.
   */
  group: string;

  /**
   * Highlighted snippet HTML.
   */
  snippet: string;

  /**
   * Ranking score.
   */
  score: number;
}

const isOpen = ref<boolean>(false);
const searchTerm = ref<string>("");
const activeResultIndex = ref<number>(0);
const searchInputElement = ref<HTMLInputElement | null>(null);
const { isDark, toggleTheme } = useTheme();
const { data: sections } = await useAsyncData("command-palette-search", () => queryCollectionSearchSections("documents"));

const paletteStyle = cva("fixed inset-0 z-[90] grid place-items-start bg-ink/25 px-3 pt-16 backdrop-blur-sm transition sm:px-4 sm:pt-24", {
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
const pageTitleByPath = computed<Record<string, string>>(() => Object.fromEntries(availableSections.value.filter((section) => !section.id.includes("#")).map((section) => [section.id, section.title])));
const shouldShowThemeCommand = computed<boolean>(() => {
  const query = normalizedSearchTerm.value;

  return !query || ["dark", "light", "theme", "mode"].some((keyword) => keyword.includes(query) || query.includes(keyword));
});
const searchResults = computed<SearchResult[]>(() => {
  const query = normalizedSearchTerm.value;
  const fallbackSections = availableSections.value.filter((section) => section.id.split("#").length === 1).slice(0, 7);
  const candidates = query ? availableSections.value : fallbackSections;

  return candidates.map((section) => createSearchResult(section, query)).filter((result) => result.score > 0).sort((firstResult, secondResult) => secondResult.score - firstResult.score).slice(0, 10);
});

/**
 * Opens the command palette.
 */
async function openPalette(): Promise<void> {
  isOpen.value = true;
  await nextTick();
  searchInputElement.value?.focus();
  searchInputElement.value?.select();
}

/**
 * Closes the command palette.
 */
function closePalette(): void {
  isOpen.value = false;
  searchTerm.value = "";
  activeResultIndex.value = 0;
}

/**
 * Escapes HTML before highlighting.
 * @param value - Raw string.
 * @returns HTML-safe string.
 */
function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/**
 * Splits the query into searchable terms.
 * @param query - User search query.
 * @returns Query terms.
 */
function getSearchTerms(query: string): string[] {
  return query.split(/\s+/).map((term) => term.trim()).filter(Boolean);
}

/**
 * Checks ordered fuzzy inclusion.
 * @param haystack - Searchable text.
 * @param needle - Query text.
 * @returns Whether every character appears in order.
 */
function hasOrderedCharacters(haystack: string, needle: string): boolean {
  let haystackIndex = 0;

  return [...needle].every((character) => {
    const foundIndex = haystack.indexOf(character, haystackIndex);
    haystackIndex = foundIndex + 1;

    return foundIndex >= 0;
  });
}

/**
 * Creates a highlighted result snippet.
 * @param section - Search section.
 * @param query - Search query.
 * @returns Highlighted snippet.
 */
function createSnippet(section: SearchSection, query: string): string {
  const sourceText = `${section.title}. ${section.content}`.replace(/\s+/g, " ").trim();
  const terms = getSearchTerms(query);
  const lowerSourceText = sourceText.toLowerCase();
  const firstMatchIndex = terms.reduce((bestIndex, term) => {
    const termIndex = lowerSourceText.indexOf(term);

    return termIndex >= 0 && termIndex < bestIndex ? termIndex : bestIndex;
  }, sourceText.length);
  const startIndex = Math.max(0, (firstMatchIndex === sourceText.length ? 0 : firstMatchIndex) - 42);
  const snippetText = sourceText.slice(startIndex, startIndex + 170);
  const escapedSnippet = `${startIndex > 0 ? "…" : ""}${escapeHtml(snippetText)}${startIndex + 170 < sourceText.length ? "…" : ""}`;

  return terms.reduce((highlightedSnippet, term) => {
    const escapedTerm = escapeHtml(term);
    const expression = new RegExp(`(${escapedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");

    return highlightedSnippet.replace(expression, "<mark>$1</mark>");
  }, escapedSnippet);
}

/**
 * Builds a ranked search result.
 * @param section - Search source.
 * @param query - Search query.
 * @returns Search result.
 */
function createSearchResult(section: SearchSection, query: string): SearchResult {
  const haystack = `${section.title} ${section.content} ${section.id}`.toLowerCase();
  const terms = getSearchTerms(query);
  const title = section.title || section.id;
  const path = section.id;
  const pagePath = path.split("#")[0] || "/docs";
  const group = pageTitleByPath.value[pagePath] || title;
  const exactScore = query && haystack.includes(query) ? 60 : 0;
  const termScore = terms.filter((term) => haystack.includes(term)).length * 18;
  const fuzzyScore = query && hasOrderedCharacters(haystack, query) ? 8 : 0;
  const emptyScore = query ? 0 : 1;

  return {
    id: section.id,
    title,
    path,
    group,
    snippet: createSnippet(section, query),
    score: exactScore + termScore + fuzzyScore + emptyScore
  };
}

/**
 * Handles global keyboard shortcuts.
 * @param event - The keyboard event.
 */
function handleKeydown(event: KeyboardEvent): void {
  const activeElement = document.activeElement;
  const isEditableElement = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement?.getAttribute("contenteditable") === "true";

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openPalette();
  }

  if (!isEditableElement && event.key === "/") {
    event.preventDefault();
    openPalette();
  }

  if (event.key === "Escape") {
    closePalette();
  }
}

/**
 * Handles keys while the palette input is focused.
 * @param event - Keyboard event.
 */
function handlePaletteKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeResultIndex.value = Math.min(searchResults.value.length - 1, activeResultIndex.value + 1);
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    activeResultIndex.value = Math.max(0, activeResultIndex.value - 1);
  }

  if (event.key !== "Enter") return;

  event.preventDefault();
  const selectedResult = searchResults.value[activeResultIndex.value];

  if (!selectedResult) return;

  selectResult(selectedResult);
}

/**
 * Navigates to a selected result.
 * @param result - Search result to open.
 */
async function selectResult(result: SearchResult): Promise<void> {
  await navigateTo(result.path);
  closePalette();
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  document.querySelectorAll("[data-command-palette-trigger]").forEach((element) => {
    element.addEventListener("click", openPalette);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  document.querySelectorAll("[data-command-palette-trigger]").forEach((element) => {
    element.removeEventListener("click", openPalette);
  });
});

watch(searchTerm, () => {
  activeResultIndex.value = 0;
});
</script>

<template>
  <div v-if="isOpen" :class="resolvedPaletteStyle" @click.self="closePalette">
    <section class="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-2xl max-sm:rounded-2xl" role="dialog" aria-modal="true" aria-label="Search docs">
      <div class="border-b border-ink/10 p-4">
        <label class="sr-only" for="command-search">Search handover content</label>
        <input id="command-search" ref="searchInputElement" v-model="searchTerm" class="w-full bg-transparent text-base outline-none placeholder:text-muted" placeholder="Search docs… Ctrl K or /" @keydown="handlePaletteKeydown" />
      </div>
      <div class="max-h-[60vh] overflow-y-auto p-2">
        <button v-if="shouldShowThemeCommand" class="group grid w-full gap-2 rounded-2xl p-4 text-left transition hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500" type="button" @click="toggleTheme">
          <span class="font-mono text-[0.64rem] tracking-[0.12em] text-violet-700">Theme</span>
          <span class="text-base font-semibold tracking-[-0.01em] text-ink">Toggle dark mode</span>
          <span class="line-clamp-2 text-sm leading-6 text-muted">Current: {{ isDark ? "dark" : "light" }}</span>
        </button>
        <p v-if="normalizedSearchTerm.length === 0" class="px-4 pb-2 pt-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink/40">Suggested pages</p>
        <button v-for="(result, resultIndex) in searchResults" :key="result.id" class="group grid w-full gap-2 rounded-2xl p-4 text-left transition hover:bg-violet-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500" :class="resultIndex === activeResultIndex ? 'bg-violet-50' : ''" type="button" @mouseenter="activeResultIndex = resultIndex" @click="selectResult(result)">
          <span class="font-mono text-[0.64rem] tracking-[0.12em] text-violet-700">{{ result.group }}</span>
          <span class="text-base font-semibold tracking-[-0.01em] text-ink">{{ result.title }}</span>
          <span class="line-clamp-2 text-sm leading-6 text-muted" v-html="result.snippet" />
        </button>
        <p v-if="searchResults.length === 0" class="p-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">No matching page.</p>
      </div>
    </section>
  </div>
</template>
