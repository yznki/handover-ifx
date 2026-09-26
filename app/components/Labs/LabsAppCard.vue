<script setup lang="ts">
import { computed } from "vue";
import { cva } from "class-variance-authority";
import { labsGateOrder, type LabsApp, type LabsGate, type LabsPhase } from "~/composables/useLabsApps/useLabsApps";

/**
 * Props for a single PSV Labs app card.
 */
interface LabsAppCardProperties {
  /**
   * The app to render.
   */
  labsApp: LabsApp;
}

const properties = defineProps<LabsAppCardProperties>();

const phaseLabels: Record<LabsPhase, string> = {
  building: "Building",
  deployed: "Live · polishing",
  done: "Live",
  blocked: "Needs a hand"
};

const gateLabels: Record<LabsGate, string> = {
  readme: "Vision README",
  checks: "Typecheck, lint and build",
  unit: "Unit tests on the engine",
  e2e: "End-to-end, desktop and mobile",
  fallback: "Works without AI",
  review: "Code review addressed",
  live: "Live smoke test",
  pushed: "Pushed to GitLab"
};

const cardStyle = cva("group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition duration-300", {
  variants: {
    live: {
      true: "border-violet-300/70 bg-surface/80 shadow-editorial hover:-translate-y-1",
      false: "border-ink/10 bg-surface/35"
    }
  }
});

const phaseBadgeStyle = cva("inline-flex items-center gap-2 rounded-full px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em]", {
  variants: {
    phase: {
      building: "bg-ink/[0.05] text-muted",
      deployed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      blocked: "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    }
  }
});

const phaseDotStyle = cva("h-1.5 w-1.5 rounded-full", {
  variants: {
    phase: {
      building: "animate-pulse bg-violet-500",
      deployed: "animate-pulse bg-emerald-500",
      done: "bg-emerald-500",
      blocked: "bg-amber-500"
    }
  }
});

const gateStyle = cva("h-1.5 flex-1 rounded-full transition-colors", {
  variants: {
    passed: {
      true: "bg-violet-500",
      false: "bg-ink/10"
    }
  }
});

const openLinkStyle = cva("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500", {
  variants: {
    live: {
      true: "bg-ink text-paper hover:bg-violet-600",
      false: "cursor-not-allowed bg-ink/[0.06] text-muted"
    }
  }
});

const passedGates = computed<Set<LabsGate>>(() => new Set(properties.labsApp.status.gatesPassed));
const cardNumber = computed<string>(() => String(properties.labsApp.number).padStart(2, "0"));
const liveHost = computed<string>(() => properties.labsApp.status.url.replace("https://", ""));
const showKnownGaps = computed<boolean>(() => properties.labsApp.status.phase !== "building" && properties.labsApp.status.knownGaps.length > 0);
const previewSource = computed<string>(() => `/labs/${properties.labsApp.identifier}.webp`);
</script>

<template>
  <article :class="cardStyle({ live: labsApp.isLive })" :data-labs-app="labsApp.identifier">
    <a v-if="labsApp.isLive" :href="labsApp.status.url" class="-mx-2 -mt-2 mb-6 block overflow-hidden rounded-2xl border border-ink/10 bg-ink/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500" target="_blank" rel="noopener" :aria-label="`Open ${labsApp.name}`">
      <img :src="previewSource" :alt="`${labsApp.name} home screen`" class="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]" width="960" height="600" loading="lazy" decoding="async">
    </a>

    <div class="mb-6 flex items-center justify-between gap-3">
      <span class="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/40">{{ cardNumber }} · {{ labsApp.relation }}</span>
      <span :class="phaseBadgeStyle({ phase: labsApp.status.phase })" data-labs-phase>
        <span :class="phaseDotStyle({ phase: labsApp.status.phase })" />
        {{ phaseLabels[labsApp.status.phase] }}
      </span>
    </div>

    <h2 class="font-display text-[1.7rem] font-extrabold leading-none tracking-[-0.03em] text-ink">{{ labsApp.name }}</h2>
    <p class="mt-3 text-[1.02rem] font-medium leading-7 text-ink/85">{{ labsApp.tagline }}</p>
    <p class="mt-3 text-sm leading-6 text-muted">{{ labsApp.problem }}</p>

    <p class="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-violet-700">{{ labsApp.audienceLabel }}</p>

    <div class="mt-5 rounded-2xl border border-violet-300/50 bg-violet-50/40 px-4 py-3">
      <p class="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-violet-700">Try this</p>
      <p class="mt-1 text-sm leading-6 text-ink/85">{{ labsApp.demo }}</p>
    </div>

    <div class="mt-6">
      <div class="mb-2 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink/40">
        <span>Definition of done</span>
        <span>{{ passedGates.size }} / {{ labsGateOrder.length }}</span>
      </div>
      <div class="flex gap-1" role="list" :aria-label="`${labsApp.name} gates`">
        <span v-for="gate in labsGateOrder" :key="gate" role="listitem" :title="gateLabels[gate]" :aria-label="`${gateLabels[gate]}: ${passedGates.has(gate) ? 'passed' : 'pending'}`" :class="gateStyle({ passed: passedGates.has(gate) })" />
      </div>
    </div>

    <details v-if="showKnownGaps" class="mt-5 rounded-2xl border border-ink/10 bg-paper/50 px-4 py-3 text-sm text-muted">
      <summary class="cursor-pointer font-mono text-[0.64rem] uppercase tracking-[0.16em] text-ink/55">{{ labsApp.status.knownGaps.length }} known gaps</summary>
      <ul class="mt-2 list-disc space-y-1 pl-4 leading-6">
        <li v-for="knownGap in labsApp.status.knownGaps" :key="knownGap">{{ knownGap }}</li>
      </ul>
    </details>

    <div class="mt-auto flex flex-wrap items-center gap-2 pt-7">
      <a v-if="labsApp.isLive" :href="labsApp.status.url" :class="openLinkStyle({ live: true })" target="_blank" rel="noopener">
        Open app <span aria-hidden="true">↗</span>
      </a>
      <span v-else :class="openLinkStyle({ live: false })" aria-disabled="true">Not live yet</span>
      <a :href="labsApp.repositoryUrl" class="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-muted transition hover:border-violet-300 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500" target="_blank" rel="noopener">
        Repository <span aria-hidden="true">↗</span>
      </a>
    </div>
    <p v-if="labsApp.isLive" class="mt-3 truncate font-mono text-[0.62rem] tracking-[0.04em] text-ink/40">{{ liveHost }}</p>
  </article>
</template>
