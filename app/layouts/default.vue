<script setup lang="ts">
import SiteHeader from "~/components/SiteHeader.vue";
import CommandPalette from "~/components/Interactive/CommandPalette.vue";
import CustomCursor from "~/components/Interactive/CustomCursor.client.vue";
</script>

<template>
  <div class="min-h-screen bg-paper text-ink">
    <SiteHeader />
    <slot />
    <CommandPalette />
    <ClientOnly>
      <CustomCursor />
    </ClientOnly>
  </div>
</template>
