<script setup lang="ts">
import { ref } from "vue";

/**
 * Stat display properties.
 */
export interface StatCounterProps {
  /**
   * Final number to show.
   */
  value: number;

  /**
   * Optional suffix.
   */
  suffix?: string;

  /**
   * Label below the number.
   */
  label: string;
}

const properties = withDefaults(defineProps<StatCounterProps>(), {
  suffix: ""
});

const displayedValue = ref<number>(properties.value);
</script>

<template>
  <div class="rounded-[2rem] border border-ink/10 bg-white/45 p-6 shadow-sm backdrop-blur">
    <div class="font-mono text-6xl font-bold tracking-[-0.08em] text-violet-700 md:text-8xl">{{ displayedValue }}{{ suffix }}</div>
    <div class="mt-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted">{{ label }}</div>
  </div>
</template>
