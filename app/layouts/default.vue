<script setup lang="ts">
import { computed } from "vue";
import SiteHeader from "~/components/SiteHeader.vue";
import CommandPalette from "~/components/Interactive/CommandPalette.vue";

const route = useRoute();

const showSiteHeader = computed<boolean>(() => route.path !== "/");
</script>

<template>
  <div class="min-h-screen bg-paper text-ink">
    <SiteHeader v-if="showSiteHeader" />
    <slot />
    <CommandPalette />
  </div>
</template>
