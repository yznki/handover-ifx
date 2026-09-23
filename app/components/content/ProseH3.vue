<script setup lang="ts">
/**
 * Prose h3 properties.
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
  <h3 :id="id" class="group scroll-mt-28 text-[1.08rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
    <a v-if="id" :href="`#${id}`" class="absolute -ml-5 hidden text-violet-600 opacity-0 transition group-hover:opacity-100 lg:inline" aria-label="Link to heading">#</a>
    <slot />
  </h3>
</template>
