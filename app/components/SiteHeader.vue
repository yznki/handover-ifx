<script setup lang="ts">
import { computed, ref } from "vue";
import { cva } from "class-variance-authority";
import ThemeToggle from "~/components/Interactive/ThemeToggle.vue";

const isNavigationOpen = ref<boolean>(false);

const navigationLinks = [
  { label: "Explore", to: "/docs" },
  { label: "Checklist", to: "/checklist" }
];

const mobileNavigationStyle = cva("fixed inset-x-4 top-16 z-50 rounded-2xl border border-ink/10 bg-paper/95 p-2 shadow-xl backdrop-blur-xl transition md:hidden", {
  variants: {
    open: {
      true: "translate-y-0 opacity-100",
      false: "pointer-events-none -translate-y-2 opacity-0"
    }
  }
});

const resolvedMobileNavigationStyle = computed<string>(() => mobileNavigationStyle({ open: isNavigationOpen.value }));

/**
 * Toggles the compact navigation menu.
 */
function toggleNavigation(): void {
  isNavigationOpen.value = !isNavigationOpen.value;
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper/75 backdrop-blur-xl">
    <div class="mx-auto flex h-14 max-w-[1760px] items-center justify-between px-4 sm:px-6">
      <NuxtLink to="/" class="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
        <span class="grid h-7 w-7 place-items-center rounded-lg bg-ink font-mono text-[0.62rem] font-bold text-paper transition group-hover:bg-violet-600">YK</span>
        <span class="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-ink/55 transition group-hover:text-ink">Infineon handover</span>
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
        <NuxtLink v-for="link in navigationLinks" :key="link.to" :to="link.to" class="rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-ink/[0.04] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500">
          {{ link.label }}
        </NuxtLink>
        <ThemeToggle />
        <button data-command-palette-trigger class="ml-1 inline-flex items-center gap-3 rounded-full border border-ink/10 bg-surface/35 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted transition hover:border-violet-300 hover:bg-surface/70 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500" type="button">
          <span>Search docs…</span>
          <kbd class="rounded-md border border-ink/10 bg-paper px-1.5 py-0.5 text-[0.62rem]">Ctrl K</kbd>
        </button>
      </nav>

      <button class="rounded-full border border-ink/10 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted md:hidden" type="button" @click="toggleNavigation">
        Menu
      </button>
    </div>

    <nav :class="resolvedMobileNavigationStyle" aria-label="Mobile navigation">
      <NuxtLink v-for="link in navigationLinks" :key="link.to" :to="link.to" class="block rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-violet-50 hover:text-violet-700" @click="toggleNavigation">
        {{ link.label }}
      </NuxtLink>
      <div class="px-4 py-3">
        <ThemeToggle />
      </div>
      <button data-command-palette-trigger class="mt-1 w-full rounded-xl border border-ink/10 px-4 py-3 text-left font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted" type="button">
        Search docs… Ctrl K
      </button>
    </nav>
  </header>
</template>
