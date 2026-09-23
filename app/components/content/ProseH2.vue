<script setup lang="ts">
/**
 * Prose h2 properties.
 */
interface ProseHeadingProperties {
  /**
   * Heading identifier.
   */
  id?: string;
}

withDefaults(defineProps<ProseHeadingProperties>(), {
  id: ""
});
</script>

<template>
  <h2 :id="id" class="group scroll-mt-28 border-t border-ink/10 pt-7 text-[1.45rem] font-semibold leading-tight tracking-[-0.015em] text-ink">
    <a v-if="id" :href="`#${id}`" class="absolute -ml-5 hidden text-violet-600 opacity-0 transition group-hover:opacity-100 lg:inline" aria-label="Link to heading">#</a>
    <slot />
  </h2>
</template>
