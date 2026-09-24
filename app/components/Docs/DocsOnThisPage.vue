<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { cva } from "class-variance-authority";

/**
 * Table-of-contents link.
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
 * Page metadata line.
 */
interface PageMetaItem {
  /**
   * Metadata label.
   */
  label: string;

  /**
   * Metadata value.
   */
  value: string;
}

/**
 * TOC properties.
 */
interface DocsOnThisPageProperties {
  /**
   * Links from Nuxt Content.
   */
  links?: TableOfContentsLink[];

  /**
   * Reading time label.
   */
  readingTime: string;

  /**
   * Optional owner label.
   */
  owner?: string;

  /**
   * Last updated label.
   */
  updated?: string;
}

const properties = withDefaults(defineProps<DocsOnThisPageProperties>(), {
  links: () => [],
  owner: "",
  updated: ""
});

const tocLinkStyle = cva("relative rounded-lg py-1.5 text-sm leading-5 text-muted transition hover:text-ink", {
  variants: {
    depth: {
      two: "pl-3",
      three: "pl-5"
    },
    active: {
      true: "text-ink",
      false: ""
    }
  }
});
const activeIdentifier = ref<string>("");
const activeIdentifiers = ref<string[]>([]);
const rangeIndicatorStyle = ref<{ top: string; height: string }>({ top: "0px", height: "0px" });
const flattenedLinks = computed<TableOfContentsLink[]>(() => properties.links.flatMap((link) => [link, ...(link.children || [])]).filter((link) => Boolean(link.id)));
const metaItems = computed<PageMetaItem[]>(() => [
  { label: "Reading", value: properties.readingTime },
  ...(properties.owner ? [{ label: "Owner", value: properties.owner }] : []),
  { label: "Updated", value: properties.updated || "2026-09-23" }
]);

/**
 * Updates the active heading based on scroll position.
 */
function updateActiveHeading(): void {
  const headings = flattenedLinks.value.map((link) => document.getElementById(link.id)).filter((element): element is HTMLElement => Boolean(element));
  const visibleHeadingIdentifiers = headings.filter((heading, headingIndex) => {
    const currentBounds = heading.getBoundingClientRect();
    const nextHeading = headings[headingIndex + 1];
    const nextBounds = nextHeading?.getBoundingClientRect();
    const sectionTop = currentBounds.top;
    const sectionBottom = nextBounds?.top || document.documentElement.scrollHeight - window.scrollY;

    return sectionBottom > 96 && sectionTop < window.innerHeight - 80;
  }).map((heading) => heading.id);
  const fallbackIdentifier = [...headings].reverse().find((heading) => heading.getBoundingClientRect().top <= window.innerHeight - 80)?.id || flattenedLinks.value[0]?.id || "";
  activeIdentifiers.value = visibleHeadingIdentifiers.length > 0 ? visibleHeadingIdentifiers : [fallbackIdentifier].filter(Boolean);
  activeIdentifier.value = activeIdentifiers.value[0] || "";
  updateRangeIndicator();
}

/**
 * Updates the visible range indicator.
 */
function updateRangeIndicator(): void {
  const tocElements = [...document.querySelectorAll("[data-toc-link]")].filter((element): element is HTMLElement => element instanceof HTMLElement);
  const activeElements = activeIdentifiers.value.map((identifier) => tocElements.find((element) => element.dataset.tocLink === identifier)).filter((element): element is HTMLElement => Boolean(element));
  const navigationElement = document.querySelector("[data-toc-navigation]");
  const firstElement = activeElements[0];
  const lastElement = activeElements[activeElements.length - 1];

  if (!navigationElement || !firstElement || !lastElement) {
    rangeIndicatorStyle.value = { top: "0px", height: "0px" };

    return;
  }

  const navigationBounds = navigationElement.getBoundingClientRect();
  const firstBounds = firstElement.getBoundingClientRect();
  const lastBounds = lastElement.getBoundingClientRect();
  rangeIndicatorStyle.value = {
    top: `${firstBounds.top - navigationBounds.top + 6}px`,
    height: `${lastBounds.bottom - firstBounds.top - 12}px`
  };
}

/**
 * Smoothly scrolls to a heading.
 * @param headingIdentifier - Target heading identifier.
 */
function scrollToHeading(headingIdentifier: string): void {
  const headingElement = document.getElementById(headingIdentifier);

  if (!headingElement) return;

  headingElement.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${headingIdentifier}`);
}

onMounted(() => {
  updateActiveHeading();
  window.addEventListener("scroll", updateActiveHeading, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateActiveHeading);
});
</script>

<template>
  <aside class="hidden xl:block">
    <div class="sticky top-20 max-h-[calc(100svh-5rem)] overflow-y-auto border-l border-ink/10 pl-6">
      <section v-if="flattenedLinks.length > 0">
        <p class="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-ink/45">On this page</p>
        <nav class="relative grid gap-1" data-toc-navigation>
          <span class="absolute left-0 w-0.5 rounded-full bg-violet-500 transition-all" :style="rangeIndicatorStyle" />
          <a
            v-for="link in flattenedLinks"
            :key="link.id"
            :href="`#${link.id}`"
            :data-toc-link="link.id"
            :data-active-toc="activeIdentifiers.includes(link.id) ? 'true' : 'false'"
            class="relative rounded-lg py-1.5 text-sm leading-5 text-muted transition hover:text-ink"
            :class="tocLinkStyle({ depth: link.depth === 3 ? 'three' : 'two', active: activeIdentifiers.includes(link.id) })"
            @click.prevent="scrollToHeading(link.id)"
          >
            {{ link.text }}
          </a>
        </nav>
      </section>
      <section class="mt-8 rounded-2xl border border-ink/10 bg-surface/35 p-4">
        <dl class="grid gap-3">
          <div v-for="item in metaItems" :key="item.label">
            <dt class="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink/40">{{ item.label }}</dt>
            <dd class="mt-1 text-sm text-ink">{{ item.value }}</dd>
          </div>
        </dl>
      </section>
    </div>
  </aside>
</template>
