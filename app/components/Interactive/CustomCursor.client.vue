<script setup lang="ts">
import { onMounted, ref } from "vue";

const cursorX = ref<number>(0);
const cursorY = ref<number>(0);
const isVisible = ref<boolean>(false);

/**
 * Updates the custom cursor position.
 * @param event - The pointer event.
 */
function updateCursor(event: PointerEvent): void {
  cursorX.value = event.clientX;
  cursorY.value = event.clientY;
  isVisible.value = true;
}

onMounted(() => {
  window.addEventListener("pointermove", updateCursor);
});
</script>

<template>
  <div v-if="isVisible" class="pointer-events-none fixed z-[100] hidden h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-500 mix-blend-multiply transition-transform duration-150 md:block" :style="{ left: `${cursorX}px`, top: `${cursorY}px` }" />
</template>
