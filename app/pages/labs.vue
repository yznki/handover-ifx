<script setup lang="ts">
import { computed, ref } from "vue";
import { cva } from "class-variance-authority";
import LabsAppCard from "~/components/Labs/LabsAppCard.vue";
import { useLabsApps } from "~/composables/useLabsApps/useLabsApps";
import type { LabsAudience } from "~/data/labsCatalog";

/**
 * Audience filter option shown above the grid.
 */
interface AudienceFilterOption {
  /**
   * Filter value, or all to disable filtering.
   */
  value: LabsAudience | "all";

  /**
   * Button label.
   */
  label: string;
}

useHead({ title: "PSV Labs · Infineon handover" });

const { labsApps, liveCount, gatesPassedCount, gatesAvailableCount, syncedAt } = useLabsApps();

const selectedAudience = ref<LabsAudience | "all">("all");

const audienceFilterOptions: AudienceFilterOption[] = [
  { value: "all", label: "All fifteen" },
  { value: "engineers", label: "CV engineers" },
  { value: "leads", label: "Leads & managers" },
  { value: "software-team", label: "SW team" }
];

const buildingPrinciples = [
  { title: "Grounded", description: "Five research agents read every repository, the planning hub and this handover, then surveyed NI SystemLink, JMP, yieldHUB, Exensio, Backstage, Rerun and more. Every idea answers a pain the team already wrote down." },
  { title: "Built in parallel", description: "Fifteen agents, one app each, one shared brief: logic first and LLM last, a deterministic engine with unit tests, seeded Post-Si data, and eight gates before anything counts as done." },
  { title: "Honest by design", description: "These are prototypes. Every repository README pitches the vision, lists the exact systems a LiveAdapter would call, and names its known gaps. AI features fall back to rule-based logic when the key is gone." }
];

const filterButtonStyle = cva("rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500", {
  variants: {
    active: {
      true: "border-ink bg-ink text-paper",
      false: "border-ink/10 bg-surface/40 text-muted hover:border-violet-300 hover:text-ink"
    }
  }
});

const visibleLabsApps = computed(() => selectedAudience.value === "all" ? labsApps : labsApps.filter((labsApp) => labsApp.audiences.includes(selectedAudience.value as LabsAudience)));
const livePercentage = computed<number>(() => Math.round((liveCount / labsApps.length) * 100));
const formattedSyncedAt = computed<string>(() => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Vienna" }).format(new Date(syncedAt)));
</script>

<template>
  <main class="mx-auto max-w-[1320px] px-4 pb-24 pt-24 sm:px-6">
    <header class="mb-12 grid gap-10 border-b border-ink/10 pb-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
      <div>
        <p class="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-violet-700">PSV Labs · fifteen prototypes</p>
        <h1 class="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-ink">Going out with a bang.</h1>
        <p class="mt-6 max-w-[64ch] text-lg leading-8 text-muted">
          Fifteen internal tools for the people who make silicon trustworthy. Each one fills a gap between AIDA, ValiBridge, LOST and TDEX, or boldly reimagines one of them. Kevin picks the ones worth keeping.
        </p>
      </div>

      <div class="rounded-3xl border border-ink/10 bg-surface/50 p-6" data-labs-progress>
        <div class="flex items-baseline justify-between">
          <span class="font-display text-5xl font-extrabold tracking-[-0.04em] text-ink">{{ liveCount }}<span class="text-2xl text-ink/35"> / {{ labsApps.length }}</span></span>
          <span class="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted">live</span>
        </div>
        <div class="mt-4 h-2 overflow-hidden rounded-full bg-ink/10">
          <div class="h-full rounded-full bg-violet-500 transition-[width] duration-500" :style="{ width: `${livePercentage}%` }" />
        </div>
        <dl class="mt-5 grid grid-cols-2 gap-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted">
          <div>
            <dt>Gates passed</dt>
            <dd class="mt-1 text-base normal-case tracking-normal text-ink">{{ gatesPassedCount }} / {{ gatesAvailableCount }}</dd>
          </div>
          <div>
            <dt>Last update</dt>
            <dd class="mt-1 text-base normal-case tracking-normal text-ink">{{ formattedSyncedAt }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <nav class="mb-8 flex flex-wrap gap-2" aria-label="Filter by audience">
      <button v-for="filterOption in audienceFilterOptions" :key="filterOption.value" :class="filterButtonStyle({ active: selectedAudience === filterOption.value })" :aria-pressed="selectedAudience === filterOption.value" type="button" @click="selectedAudience = filterOption.value">
        {{ filterOption.label }}
      </button>
    </nav>

    <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="PSV Labs apps">
      <LabsAppCard v-for="labsApp in visibleLabsApps" :key="labsApp.identifier" :labs-app="labsApp" />
    </section>

    <section class="mt-20 border-t border-ink/10 pt-12">
      <p class="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-violet-700">How this was built</p>
      <div class="grid gap-5 md:grid-cols-3">
        <article v-for="principle in buildingPrinciples" :key="principle.title" class="rounded-3xl border border-ink/10 bg-surface/30 p-6">
          <h2 class="text-lg font-semibold tracking-[-0.01em] text-ink">{{ principle.title }}</h2>
          <p class="mt-3 text-sm leading-6 text-muted">{{ principle.description }}</p>
        </article>
      </div>
      <div class="mt-5 rounded-3xl border border-violet-300/60 bg-violet-50/50 p-6">
        <h2 class="text-lg font-semibold tracking-[-0.01em] text-ink">What happens next</h2>
        <p class="mt-3 max-w-[80ch] text-sm leading-6 text-muted">
          Everything here runs in the playground namespace <code class="font-mono text-ink/80">play-yazi-kamikazi</code> and expires around 2026-12-22. Kevin triages the suite and promotes the two or three worth taking to production into their own namespace. Everything else simply fades out with the playground. Each repository's README explains who could adopt it and why.
        </p>
      </div>
    </section>
  </main>
</template>
