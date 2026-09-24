<script setup lang="ts">
import { cva } from "class-variance-authority";
import { useTheme } from "~/composables/useTheme/useTheme";

/**
 * Theme toggle properties.
 */
interface ThemeToggleProperties {
  /**
   * Visual treatment.
   */
  variant?: "icon" | "text";
}

const properties = withDefaults(defineProps<ThemeToggleProperties>(), {
  variant: "icon"
});

const { isDark, toggleTheme } = useTheme();

const buttonStyle = cva("group inline-flex items-center justify-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500", {
  variants: {
    variant: {
      icon: "h-9 w-9 rounded-full border border-ink/10 bg-surface/35 text-muted hover:border-violet-300 hover:bg-surface/70 hover:text-ink",
      text: "font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/35 hover:text-ink"
    }
  }
});

/**
 * Toggles the theme from a button press.
 */
function handleToggleTheme(): void {
  toggleTheme();
}
</script>

<template>
  <button
    :class="buttonStyle({ variant: properties.variant })"
    type="button"
    :aria-pressed="isDark"
    title="Toggle dark mode"
    @click="handleToggleTheme"
  >
    <span v-if="properties.variant === 'text'">dark: {{ isDark ? "on" : "off" }}</span>
    <span v-else class="relative grid h-4 w-4 place-items-center" aria-hidden="true">
      <span class="absolute h-4 w-4 rounded-full border border-current transition duration-300 motion-reduce:transition-none" :class="isDark ? 'scale-75 rotate-180 bg-current' : 'scale-100 rotate-0 bg-transparent'" />
      <span class="absolute h-2 w-2 rounded-full bg-paper transition duration-300 motion-reduce:transition-none" :class="isDark ? 'translate-x-1 -translate-y-1 opacity-100' : 'translate-x-0 translate-y-0 opacity-0'" />
    </span>
    <span class="sr-only">Toggle dark mode</span>
  </button>
</template>
