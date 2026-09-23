<script setup lang="ts">
import { computed, ref } from "vue";
import { cva } from "class-variance-authority";

const isNavigationOpen = ref<boolean>(false);

const navigationLinks = [
  { label: "Story", to: "/" },
  { label: "Explore", to: "/docs/aida-architecture" },
  { label: "Checklist", to: "/checklist" }
];

const mobileNavigationStyle = cva("fixed inset-x-4 top-20 z-50 rounded-[2rem] border border-ink/10 bg-paper/95 p-4 shadow-editorial backdrop-blur transition md:hidden", {
  variants: {
    open: {
      true: "translate-y-0 opacity-100",
      false: "pointer-events-none -translate-y-3 opacity-0"
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
  <header class="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-paper/80 backdrop-blur-xl">
    <div class="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:px-8">
      <NuxtLink to="/" class="group flex items-center gap-3">
        <span class="grid h-9 w-9 place-items-center rounded-full bg-violet-500 font-mono text-xs font-bold text-paper shadow-violet">YK</span>
        <span class="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-muted transition group-hover:text-violet-700">Infineon handover</span>
      </NuxtLink>

      <nav class="hidden items-center gap-2 rounded-full border border-ink/10 bg-white/40 p-1 md:flex">
        <NuxtLink v-for="link in navigationLinks" :key="link.to" :to="link.to" class="rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-muted transition hover:bg-violet-50 hover:text-violet-700">
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="hidden justify-end md:flex">
        <button data-command-palette-trigger class="rounded-full border border-ink/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-muted transition hover:border-violet-500 hover:text-violet-700">
          Ctrl K
        </button>
      </div>

      <button class="rounded-full border border-ink/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] md:hidden" @click="toggleNavigation">
        Menu
      </button>
    </div>

    <nav :class="resolvedMobileNavigationStyle">
      <NuxtLink v-for="link in navigationLinks" :key="link.to" :to="link.to" class="block rounded-2xl px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-muted hover:bg-violet-50 hover:text-violet-700" @click="toggleNavigation">
        {{ link.label }}
      </NuxtLink>
      <button data-command-palette-trigger class="mt-2 w-full rounded-2xl border border-ink/10 px-4 py-3 text-left font-mono text-xs uppercase tracking-[0.18em] text-muted">
        Search content
      </button>
    </nav>
  </header>
</template>
