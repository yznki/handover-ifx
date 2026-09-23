<script setup lang="ts">
/**
 * Prose image properties.
 */
interface ProseImageProperties {
  /**
   * Image source.
   */
  src?: string;

  /**
   * Alternative text and caption.
   */
  alt?: string;
}

withDefaults(defineProps<ProseImageProperties>(), {
  src: "",
  alt: ""
});
</script>

<template>
  <figure class="my-8 overflow-hidden rounded-3xl border border-ink/10 bg-white/50 p-2 shadow-sm">
    <a :href="src" target="_blank" rel="noreferrer">
      <img :src="src" :alt="alt" class="w-full rounded-2xl border border-ink/10" loading="lazy">
    </a>
    <figcaption v-if="alt" class="px-3 py-2 text-sm leading-6 text-muted">{{ alt }}</figcaption>
  </figure>
</template>
