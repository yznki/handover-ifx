<script setup lang="ts">
/**
 * Visual beat properties.
 */
export interface StoryBeatVisualProps {
  /**
   * Visual type requested by the content beat.
   */
  visual?: string;

  /**
   * Chapter identifier for fallback styling.
   */
  chapter?: string;
}

const properties = withDefaults(defineProps<StoryBeatVisualProps>(), {
  visual: "default",
  chapter: ""
});

const repositoryNodes = ["AIDA", "aida-planning", "CVC", "valibridge-client", "valibridge-api", "lost-client", "tim-client", "jira-ai-client", "instruments-client", "editable-table", "archived Bitbucket"];
const pipelineStages = ["verify", "build", "semantic-release", "docker push", "oc deploy"];
const mindWorkflowStages = ["understand", "ticket", "upstream CVC", "research + fix", "browser test", "merge when it works"];
const migrationSteps = ["0.3.0 stable", "Turborepo unchanged", "extract editor", "family by family", "ValiBridge pilot"];
const ledgerItems = ["showcase split", "AIDA promote", "CVC 0.3.0", "token rotate", "4026 / 3677"];
</script>

<template>
  <div class="relative min-h-[22rem] min-w-0 overflow-hidden rounded-[2.5rem] border border-ink/10 bg-white/45 p-6 shadow-editorial backdrop-blur md:min-h-[32rem] md:p-8">
    <div v-if="visual === 'repo-map' || visual === 'cvc-consumers' || visual === 'planning-link' || visual === 'bridge-link' || visual === 'archive-fade'" class="grid h-full content-center gap-4">
      <svg viewBox="0 0 760 420" class="h-full w-full" role="img" aria-label="Repository connection map">
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#6D3BFF" /></marker>
        </defs>
        <path d="M210 180 C320 80 440 80 550 180" stroke="#6D3BFF" stroke-width="4" fill="none" marker-end="url(#arrow)" />
        <path d="M210 210 C330 300 450 300 550 210" stroke="#6D3BFF" stroke-width="4" fill="none" marker-end="url(#arrow)" />
        <path d="M380 250 L380 330" stroke="#151417" stroke-opacity="0.25" stroke-width="3" stroke-dasharray="8 8" />
        <g v-for="(node, nodeIndex) in repositoryNodes" :key="node" :transform="`translate(${80 + (nodeIndex % 5) * 150}, ${80 + Math.floor(nodeIndex / 5) * 120})`" :opacity="node.includes('archived') ? 0.35 : 1">
          <rect x="-58" y="-24" width="116" height="48" rx="24" :fill="node === 'AIDA' ? '#151417' : node === 'CVC' ? '#6D3BFF' : '#F0EBFF'" />
          <text text-anchor="middle" y="5" font-family="Geist Mono" font-size="12" :fill="node === 'AIDA' || node === 'CVC' ? '#F6F4EF' : '#2A1765'">{{ node }}</text>
        </g>
        <text x="380" y="398" text-anchor="middle" font-family="Geist Mono" font-size="13" fill="#6F6A62">AIDA does not consume CVC</text>
      </svg>
    </div>

    <div v-else-if="visual?.includes('pipeline') || visual === 'branch-release' || visual === 'quirks-box'" class="flex h-full flex-col justify-center gap-6">
      <div class="flex flex-wrap items-center gap-3">
        <template v-for="(stage, stageIndex) in pipelineStages" :key="stage">
          <div class="min-w-0 rounded-full bg-violet-500 px-4 py-3 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper shadow-violet md:px-5 md:py-4 md:text-xs">{{ stage }}</div>
          <div v-if="stageIndex < pipelineStages.length - 1" class="h-px w-12 bg-violet-500" />
        </template>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div class="min-w-0 rounded-[1.5rem] border border-ink/10 bg-paper p-5"><span class="font-mono text-xs uppercase tracking-[0.18em] text-violet-700">develop</span><p class="mt-2 break-words text-[clamp(1.45rem,2.2vw,2rem)] font-extrabold leading-tight tracking-[-0.04em]">prerelease</p></div>
        <div class="min-w-0 rounded-[1.5rem] border border-ink/10 bg-paper p-5"><span class="font-mono text-xs uppercase tracking-[0.18em] text-violet-700">master</span><p class="mt-2 break-words text-[clamp(1.45rem,2.2vw,2rem)] font-extrabold leading-tight tracking-[-0.04em]">stable</p></div>
      </div>
    </div>

    <div v-else-if="visual === 'workflow-timeline'" class="flex h-full flex-col justify-center gap-4">
      <div v-for="(stage, stageIndex) in mindWorkflowStages" :key="stage" class="grid grid-cols-[3rem_1fr] items-center gap-4">
        <span class="font-mono text-4xl font-black tracking-[-0.08em] text-violet-700">{{ stageIndex + 1 }}</span>
        <span class="min-w-0 rounded-full border border-ink/10 bg-paper px-5 py-4 font-mono text-xs uppercase tracking-[0.14em] text-ink">{{ stage }}</span>
      </div>
    </div>

    <div v-else-if="visual === 'model-diagram'" class="grid h-full place-items-center">
      <div class="grid w-full max-w-xl grid-cols-1 items-center gap-3 text-center md:grid-cols-3">
        <div class="min-w-0 rounded-[2rem] bg-ink p-6 text-paper"><p class="font-mono text-xs uppercase tracking-[0.18em]">Opus</p><p class="mt-2 text-2xl font-extrabold">plan</p></div>
        <div class="min-w-0 rounded-full bg-violet-500 px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper md:text-xs">orchestrates</div>
        <div class="min-w-0 rounded-[2rem] bg-violet-50 p-6 text-violet-700"><p class="font-mono text-xs uppercase tracking-[0.18em]">Sonnet</p><p class="mt-2 text-2xl font-extrabold">work</p></div>
      </div>
    </div>

    <div v-else-if="visual === 'tradeoff-cards'" class="grid h-full content-center gap-4 md:grid-cols-3">
      <div v-for="card in ['upstream first', 'deadline: quick then clean', 'who makes more sense wins']" :key="card" class="min-w-0 rounded-[2rem] bg-violet-50 p-6"><p class="break-words text-[clamp(1.6rem,2.3vw,2rem)] font-extrabold leading-tight tracking-[-0.04em] text-violet-700">{{ card }}</p></div>
    </div>

    <div v-else-if="visual === 'red-flags'" class="grid h-full content-center gap-3">
      <p v-for="flag in ['blind vibe coding', 'new packages without research', 'god components', 'utility dumps', 'duplicated logic', 'abbreviations']" :key="flag" class="break-words text-[clamp(2rem,3.4vw,3rem)] font-extrabold leading-tight tracking-[-0.04em] text-ink line-through decoration-violet-500 decoration-[0.16em]">{{ flag }}</p>
    </div>

    <div v-else-if="visual === 'aida-loop' || visual === 'v1-track' || visual === 'status-strip'" class="flex h-full flex-col justify-center gap-8">
      <div class="flex flex-wrap gap-3">
        <span v-for="step in ['Ingest', 'Transform', 'Plot', 'Refine', 'Export']" :key="step" class="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper md:px-6 md:py-4">{{ step }}</span>
      </div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-3">
        <div v-for="status in ['01 delivery', '02 ticketed', '03 ticketed', '04 next', '05 planned']" :key="status" class="min-w-0 break-words rounded-[1.4rem] border border-violet-500/20 bg-violet-50 p-4 text-center font-mono text-[0.68rem] uppercase tracking-[0.08em] text-violet-700 md:text-xs">{{ status }}</div>
      </div>
    </div>

    <div v-else-if="visual === 'cvc-monolith' || visual === 'cvc-split' || visual === 'migration-steps' || visual === 'idea-stamp'" class="grid h-full content-center gap-6">
      <div class="relative mx-auto grid h-44 w-44 place-items-center rounded-[2rem] bg-ink text-center font-mono text-xs uppercase tracking-[0.18em] text-paper shadow-editorial">one package</div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-3">
        <div v-for="step in migrationSteps" :key="step" class="min-w-0 break-words rounded-[1.2rem] bg-violet-50 p-4 text-center font-mono text-[0.64rem] uppercase tracking-[0.1em] text-violet-700 md:text-xs">{{ step }}</div>
      </div>
      <div class="mx-auto rotate-[-4deg] rounded-xl border-4 border-violet-500 px-5 py-3 text-center font-mono text-[clamp(1rem,2vw,1.25rem)] font-extrabold uppercase tracking-[0.16em] text-violet-700">Idea — pitch to Kevin</div>
    </div>

    <div v-else-if="visual?.includes('ledger')" class="grid h-full content-center gap-3">
      <div v-for="(item, itemIndex) in ledgerItems" :key="item" class="grid grid-cols-[3rem_1fr] items-center gap-3 rounded-[1.4rem] border border-ink/10 bg-paper p-4">
        <span class="font-mono text-2xl font-black text-violet-700">{{ itemIndex + 1 }}</span>
        <span class="min-w-0 break-words font-mono text-xs uppercase tracking-[0.14em] text-ink">{{ item }}</span>
      </div>
    </div>

    <div v-else-if="visual === 'handover-split' || visual === 'whatsapp-line'" class="grid h-full place-items-center">
      <div class="grid w-full max-w-2xl grid-cols-1 items-center gap-4 text-center md:grid-cols-[1fr_auto_1fr] md:gap-5">
        <div class="rounded-full bg-violet-500 p-8 text-5xl font-black text-paper">U</div>
        <div class="font-hand text-5xl text-violet-700">handover</div>
        <div class="rounded-full bg-ink p-8 text-5xl font-black text-paper">S</div>
      </div>
    </div>

    <div v-else class="grid h-full place-items-center text-center">
      <div class="text-[clamp(5rem,18vw,15rem)] font-black leading-none tracking-[-0.14em] text-violet-500">{{ properties.chapter.slice(0, 2) || "YK" }}</div>
    </div>
  </div>
</template>
