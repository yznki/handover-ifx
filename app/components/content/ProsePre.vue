<script setup lang="ts">
import { ref } from "vue";

const copied = ref<boolean>(false);

/**
 * Copies the visible code block text.
 */
async function copyCode(): Promise<void> {
  const codeElement = document.activeElement?.closest("figure")?.querySelector("code");
  const codeText = codeElement?.textContent || "";

  if (!codeText) return;

  await navigator.clipboard.writeText(codeText);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 1_200);
}
</script>

<template>
  <figure class="group my-6 overflow-hidden rounded-2xl border border-ink/10 bg-[#17151c] shadow-sm">
    <figcaption class="flex items-center justify-between border-b border-white/10 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/45">
      <span>code</span>
      <button class="rounded-full border border-white/10 px-3 py-1 text-white/70 transition hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300" type="button" @click="copyCode">
        {{ copied ? "copied" : "copy" }}
      </button>
    </figcaption>
    <pre class="m-0 overflow-x-auto p-4 text-[0.86rem] leading-6 text-[#f6f4ef]"><slot /></pre>
  </figure>
</template>
