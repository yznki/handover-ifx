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
    data-theme-toggle
    :aria-pressed="isDark"
    title="Toggle dark mode"
    @click="handleToggleTheme"
  >
    <span v-if="properties.variant === 'text'">dark: {{ isDark ? "on" : "off" }}</span>
    <span v-else class="relative grid h-[18px] w-[18px] place-items-center overflow-hidden" aria-hidden="true">
      <svg data-theme-icon-sun class="absolute h-[18px] w-[18px] transition duration-300 motion-reduce:transition-none" :class="isDark ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4.25" stroke="currentColor" stroke-width="2" />
        <path d="M12 2.75V5M12 19v2.25M4.75 4.75l1.6 1.6M17.65 17.65l1.6 1.6M2.75 12H5M19 12h2.25M4.75 19.25l1.6-1.6M17.65 6.35l1.6-1.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <svg data-theme-icon-moon class="absolute h-[18px] w-[18px] transition duration-300 motion-reduce:transition-none" :class="isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0'" viewBox="0 0 24 24" fill="none">
        <path d="M19.25 15.15A7.55 7.55 0 0 1 8.85 4.75 8.15 8.15 0 1 0 19.25 15.15Z" fill="currentColor" />
      </svg>
    </span>
    <span class="sr-only">Toggle dark mode</span>
  </button>
</template>
