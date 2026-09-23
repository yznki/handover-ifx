<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { cva } from "class-variance-authority";
import { useReducedMotion } from "~/composables/useReducedMotion/useReducedMotion";

/**
 * Meme visual format.
 */
type MemeFormat = "drake" | "brain" | "starter" | "tier" | "dialog" | "tweet" | "jira" | "fire" | "buttons" | "pigeon" | "terminal" | "caption" | "handoff" | "approval" | "npm" | "expectation" | "slack" | "sticker";

/**
 * Meme card size.
 */
type MemeSize = "small" | "medium" | "wide" | "tall" | "hero";

/**
 * Meme accent colour.
 */
type MemeAccent = "purple" | "acid" | "ink";

/**
 * True-fact meme data.
 */
interface MemeCard {
  /**
   * Stable meme identifier.
   */
  id: string;

  /**
   * Meme visual format.
   */
  format: MemeFormat;

  /**
   * Top label.
   */
  eyebrow: string;

  /**
   * Main meme headline.
   */
  title: string;

  /**
   * Supporting factual joke.
   */
  punchline: string;

  /**
   * Optional hidden punchline.
   */
  hiddenPunchline?: string;

  /**
   * Documentation link.
   */
  realLink: string;

  /**
   * Card size.
   */
  size: MemeSize;

  /**
   * Accent theme.
   */
  accent: MemeAccent;

  /**
   * Rotation utility class.
   */
  rotationClass: string;

  /**
   * Optional list items.
   */
  items?: string[];

  /**
   * Optional secondary list items.
   */
  secondaryItems?: string[];
}

const router = useRouter();

const reactionCounts = ref<Record<string, number>>({});
const revealedMemeIds = ref<string[]>([]);
const memeOfDayIndex = ref<number>(0);
const shuffleSeed = ref<number>(0);
const acceptanceConfetti = ref<boolean>(false);

const storageKey = "handover-meme-reactions";

const memes: MemeCard[] = [
  {
    id: "fix-upstream",
    format: "drake",
    eyebrow: "CVC instinct",
    title: "Patch client? absolutely not.",
    punchline: "If the root cause lives in CVC, I fix it upstream so the ghost only dies once.",
    hiddenPunchline: "One bug. One fix. One less future séance.",
    realLink: "/docs/how-my-mind-works",
    size: "wide",
    accent: "purple",
    rotationClass: "-rotate-1",
    items: ["new npm package", "client-only patch"],
    secondaryItems: ["research first", "fix upstream in CVC"]
  },
  {
    id: "cicd-brain",
    format: "brain",
    eyebrow: "CI/CD enlightenment",
    title: "Five stages. Many emotions.",
    punchline: "verify → build → semantic-release → docker push → oc deploy. Develop prereleases; master stabilises.",
    realLink: "/docs/cicd-aida",
    size: "tall",
    accent: "acid",
    rotationClass: "rotate-2",
    items: ["git push", "semantic-release knows", "container exists", "OpenShift accepts tribute"]
  },
  {
    id: "starter-pack",
    format: "starter",
    eyebrow: "AIDA starter pack",
    title: "Taking over AIDA, legally.",
    punchline: "Start with the planning skill, codebase map, workflow docs, and one heroic coffee.",
    realLink: "/docs/aida-planning",
    size: "medium",
    accent: "ink",
    rotationClass: "rotate-1",
    items: ["aida-plan-workflow", "docs/codebase-map", "workflow tickets", "coffee, probably"]
  },
  {
    id: "jira-pat",
    format: "dialog",
    eyebrow: "Windows 98 says",
    title: "Personal Jira token detected.",
    punchline: "Rotate `aida-planning-jira-token` away from my personal token. No secrets, just the job name.",
    hiddenPunchline: "The secret value is not here because we enjoy employment.",
    realLink: "/docs/unfinished-business",
    size: "medium",
    accent: "purple",
    rotationClass: "-rotate-2",
    items: ["OK", "Ask Kevin", "Rotate it"]
  },
  {
    id: "verify-no-tests",
    format: "fire",
    eyebrow: "This is fine, pipeline edition",
    title: "AIDA verify has no test job.",
    punchline: "A factual quirk, not a lifestyle recommendation.",
    realLink: "/docs/cicd-aida",
    size: "medium",
    accent: "acid",
    rotationClass: "rotate-1"
  },
  {
    id: "handover-ticket",
    format: "jira",
    eyebrow: "Fake Jira",
    title: "HANDOVER-1: Yazan leaves",
    punchline: "Priority: Blocker. Resolution: Explore mode exists.",
    realLink: "/docs/unfinished-business",
    size: "small",
    accent: "ink",
    rotationClass: "-rotate-1",
    items: ["Assignee: everyone", "Status: emotionally in progress", "Fix version: Monday"]
  },
  {
    id: "showcase-branch",
    format: "terminal",
    eyebrow: "git archaeology",
    title: "showcase/aida-demo is ahead by 33 commits.",
    punchline: "Split it into standalone fixes + onboarding tour, then delete the showcase branch.",
    realLink: "/docs/unfinished-business",
    size: "wide",
    accent: "purple",
    rotationClass: "rotate-1",
    items: ["git log --oneline", "33 commits staring back", "two merge requests, then goodbye"]
  },
  {
    id: "cvc-split",
    format: "expectation",
    eyebrow: "Idea, not approved",
    title: "Break the monolith, pitch Kevin first.",
    punchline: "CVC split is only my idea. Sandro and Uqba decide boundaries; Kevin gets the logic.",
    hiddenPunchline: "Pitch deck energy, but make it dependency boundaries.",
    realLink: "/docs/cvc-now-and-next",
    size: "wide",
    accent: "acid",
    rotationClass: "-rotate-2",
    items: ["one package carries the world"],
    secondaryItems: ["@psvcommon/ui + families"]
  },
  {
    id: "oc-login",
    format: "dialog",
    eyebrow: "OpenShift popup",
    title: "oc login --insecure-skip-tls-verify",
    punchline: "Are you sure? The pipeline is sure. OpenShift is also sure.",
    realLink: "/docs/deploy-hicp-by-hand",
    size: "small",
    accent: "ink",
    rotationClass: "rotate-2",
    items: ["Yes", "Also yes"]
  },
  {
    id: "workflow-status",
    format: "tier",
    eyebrow: "Workflow tier list",
    title: "AIDA workflows, ranked by how much they exist.",
    punchline: "01 is in delivery; 02/03 are ticketed; 04 Assistant is next and not grilled yet; 05 is platform.",
    realLink: "/docs/aida-workflows-status",
    size: "wide",
    accent: "purple",
    rotationClass: "rotate-1",
    items: ["S: Workflow 01", "A: Workflows 02–03", "B: Workflow 04 Assistant", "Later: Workflow 05"]
  },
  {
    id: "research-first",
    format: "buttons",
    eyebrow: "Two buttons sweating",
    title: "Debug for six hours or research first?",
    punchline: "The thing I would do differently: research and read more before over-debugging.",
    realLink: "/docs/how-my-mind-works",
    size: "medium",
    accent: "acid",
    rotationClass: "-rotate-1",
    items: ["debug harder", "read docs first"]
  },
  {
    id: "logic-approved",
    format: "approval",
    eyebrow: "Kevin rule",
    title: "Logical reasoning? approved.",
    punchline: "The unwritten rule is simple: Kevin approves logic that makes sense.",
    realLink: "/docs/how-my-mind-works",
    size: "small",
    accent: "purple",
    rotationClass: "rotate-2"
  },
  {
    id: "excel-retired",
    format: "pigeon",
    eyebrow: "Is this a pigeon?",
    title: "Is this a plot?",
    punchline: "AIDA exists to turn the Excel ritual into ingest → transform → plot → refine → export.",
    realLink: "/docs/aida-vision-v1",
    size: "medium",
    accent: "ink",
    rotationClass: "-rotate-2"
  },
  {
    id: "cvc-consumers",
    format: "caption",
    eyebrow: "Component dependency buffet",
    title: "CVC consumers entering the room like:",
    punchline: "valibridge-client, lost-client, tim-client, jira-ai-client, instruments-client, editable-table. AIDA sits apart.",
    realLink: "/docs/cvc-consumers",
    size: "wide",
    accent: "purple",
    rotationClass: "rotate-1"
  },
  {
    id: "release-cvc",
    format: "npm",
    eyebrow: "npm install anxiety",
    title: "CVC 0.3.0 stable wants out.",
    punchline: "Pre-1.0 semantic-release rule: do not use `feat!` or BREAKING CHANGE for CVC.",
    realLink: "/docs/cicd-cvc",
    size: "medium",
    accent: "acid",
    rotationClass: "-rotate-1",
    items: ["semantic-release", "prepack", "local consumer test", "stable release"]
  },
  {
    id: "playground-expiry",
    format: "tweet",
    eyebrow: "Tiny public service announcement",
    title: "Playground namespace expires around 2026-12-22.",
    punchline: "Future you deserves a reminder before OpenShift becomes a pumpkin.",
    realLink: "/docs/unfinished-business",
    size: "small",
    accent: "ink",
    rotationClass: "rotate-2"
  },
  {
    id: "valibridge",
    format: "sticker",
    eyebrow: "ValiBridge chapter",
    title: "You already know this better than me.",
    punchline: "So the ValiBridge section stays short on purpose.",
    realLink: "/docs/valibridge",
    size: "small",
    accent: "purple",
    rotationClass: "-rotate-2"
  },
  {
    id: "assistant-next",
    format: "slack",
    eyebrow: "Teams, spiritually",
    title: "Uqba plans Workflow 04 Assistant.",
    punchline: "Use aida-plan-workflow + competitor research before the real work starts.",
    realLink: "/docs/aida-workflows-status",
    size: "medium",
    accent: "acid",
    rotationClass: "rotate-1"
  },
  {
    id: "local-cvc-test",
    format: "terminal",
    eyebrow: "consumer app ritual",
    title: "Test CVC inside a real consumer.",
    punchline: "Playground → prepack local package → install locally in the consumer → browser says yes or no.",
    realLink: "/docs/cvc-local-testing",
    size: "wide",
    accent: "ink",
    rotationClass: "-rotate-1",
    items: ["pnpm playground", "pnpm prepack", "pnpm add file:...", "open the consumer"]
  },
  {
    id: "handoff",
    format: "handoff",
    eyebrow: "chosen ones",
    title: "Uqba + Sandro, you're holding the map now.",
    punchline: "I left jokes here and the grown-up version in Explore. Questions go to the WhatsApp group.",
    realLink: "/docs/people-and-access",
    size: "hero",
    accent: "purple",
    rotationClass: "rotate-1"
  }
];
const fallbackMeme: MemeCard = memes[0] as MemeCard;

const cardStyle = cva("group relative min-h-[22rem] overflow-hidden border-[3px] border-ink bg-paper p-5 shadow-hard transition duration-300 hover:-translate-y-2 hover:rotate-0 hover:shadow-hard-lg focus-within:-translate-y-2 md:p-6", {
  variants: {
    size: {
      small: "md:col-span-1 md:min-h-[22rem]",
      medium: "md:col-span-1 md:min-h-[30rem]",
      wide: "md:col-span-2 md:min-h-[28rem]",
      tall: "md:col-span-1 md:row-span-2 md:min-h-[40rem]",
      hero: "md:col-span-3 md:min-h-[30rem]"
    },
    accent: {
      purple: "selection:bg-violet-500",
      acid: "selection:bg-[#C6FF3D]",
      ink: "selection:bg-ink"
    }
  }
});
const accentStickerStyle = cva("inline-flex rotate-[-2deg] border-2 border-ink px-3 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] shadow-[3px_3px_0_#151417]", {
  variants: {
    accent: {
      purple: "bg-violet-500 text-paper",
      acid: "bg-[#C6FF3D] text-ink",
      ink: "bg-ink text-paper"
    }
  }
});
const reactionButtonStyle = cva("rounded-full border-2 border-ink bg-paper px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.12em] shadow-[3px_3px_0_#151417] transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-500");
const revealButtonStyle = cva("rounded-full bg-ink px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-paper transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500");

const orderedMemes = computed<MemeCard[]>(() => {
  const copiedMemes = [...memes];
  return copiedMemes.sort((firstMeme, secondMeme) => calculateShuffleValue(firstMeme.id) - calculateShuffleValue(secondMeme.id));
});
const memeOfDay = computed<MemeCard>(() => orderedMemes.value[memeOfDayIndex.value % orderedMemes.value.length] || orderedMemes.value[0] || fallbackMeme);
const totalReactions = computed<number>(() => Object.values(reactionCounts.value).reduce((total, count) => total + count, 0));

/**
 * Calculates a stable shuffle value for a meme.
 * @param memeId - Meme identifier.
 * @returns Numeric shuffle value.
 */
function calculateShuffleValue(memeId: string): number {
  return Array.from(memeId).reduce((total, character) => total + character.charCodeAt(0), shuffleSeed.value * 97) % 997;
}

/**
 * Reads reactions from local storage.
 */
function hydrateReactions(): void {
  const rawReactions = window.localStorage.getItem(storageKey);
  if (!rawReactions) return;
  reactionCounts.value = JSON.parse(rawReactions) as Record<string, number>;
}

/**
 * Persists reactions to local storage.
 */
function persistReactions(): void {
  window.localStorage.setItem(storageKey, JSON.stringify(reactionCounts.value));
}

/**
 * Adds one laugh reaction.
 * @param memeId - Meme identifier.
 */
function addReaction(memeId: string): void {
  reactionCounts.value = { ...reactionCounts.value, [memeId]: (reactionCounts.value[memeId] || 0) + 1 };
  persistReactions();
}

/**
 * Toggles hidden punchline visibility.
 * @param memeId - Meme identifier.
 */
function toggleReveal(memeId: string): void {
  const isRevealed = revealedMemeIds.value.includes(memeId);
  revealedMemeIds.value = isRevealed ? revealedMemeIds.value.filter((revealedMemeId) => revealedMemeId !== memeId) : [...revealedMemeIds.value, memeId];
}

/**
 * Shuffles meme order.
 */
function shuffleMemes(): void {
  shuffleSeed.value += 1;
}

/**
 * Picks the next meme of the day.
 */
function randomizeMemeOfDay(): void {
  memeOfDayIndex.value = (memeOfDayIndex.value + 7) % orderedMemes.value.length;
}

/**
 * Triggers the final confetti state.
 */
function acceptHandover(): void {
  acceptanceConfetti.value = true;
  window.setTimeout(() => {
    acceptanceConfetti.value = false;
    router.push("/checklist");
  }, 900);
}

onMounted(() => {
  hydrateReactions();
});
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-paper text-ink" data-meme-wall>
    <section class="relative min-h-[100svh] border-b-[3px] border-ink px-4 pb-10 pt-8 md:px-8">
      <div class="absolute right-8 top-28 hidden rotate-6 border-[3px] border-ink bg-[#C6FF3D] px-5 py-3 font-hand text-4xl shadow-hard md:block">no 3D ribbon today</div>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <NuxtLink to="/docs/aida-architecture" class="rounded-full border-[3px] border-ink bg-paper px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] shadow-[4px_4px_0_#151417] transition hover:-translate-y-1">Explore the real docs →</NuxtLink>
        <button class="rounded-full border-[3px] border-ink bg-[#C6FF3D] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] shadow-[4px_4px_0_#151417] transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-500" data-shuffle-memes @click="shuffleMemes">Shuffle memes</button>
      </div>
      <p class="mb-3 font-mono text-xs font-bold uppercase tracking-[0.32em] text-violet-700">Yazan's handover — the meme edition</p>
      <h1 class="max-w-[11ch] font-display text-[clamp(4.3rem,12vw,12rem)] font-black uppercase leading-[0.78] tracking-[-0.07em]">
        I'm leaving. Here are the memes.
      </h1>
      <div class="mt-8 grid gap-4 md:grid-cols-[1fr_0.65fr]">
        <div class="border-[3px] border-ink bg-violet-500 p-4 text-paper shadow-hard">
          <p class="font-meme text-[clamp(2.6rem,6vw,6rem)] uppercase leading-none text-paper [text-shadow:3px_3px_0_#151417]">Laugh here.</p>
          <p class="font-meme text-[clamp(2.6rem,6vw,6rem)] uppercase leading-none text-paper [text-shadow:3px_3px_0_#151417]">Learn in Explore.</p>
        </div>
        <aside class="-rotate-2 border-[3px] border-ink bg-paper p-5 shadow-hard">
          <p class="font-hand text-4xl text-violet-700">Facts only, chaos-friendly.</p>
          <p class="mt-3 text-lg leading-tight text-muted">Every joke links to the serious doc. No secrets, no fake plans, no roasting interns.</p>
        </aside>
      </div>
      <div class="-mx-4 mt-10 overflow-hidden border-y-[3px] border-ink bg-ink py-3 text-paper md:-mx-8">
        <div class="animate-[marquee_24s_linear_infinite] whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.2em] motion-reduce:animate-none">
          ⚠ Jira PAT is personal ⚠ AIDA verify has no test job ⚠ develop is prerelease ⚠ master is stable ⚠ CVC split is an idea ⚠ ask Kevin about access ⚠
        </div>
      </div>
    </section>

    <section class="sticky top-0 z-30 border-b-[3px] border-ink bg-paper/95 px-4 py-3 backdrop-blur md:px-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button class="rounded-full border-2 border-ink bg-[#C6FF3D] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] shadow-[3px_3px_0_#151417]" data-meme-of-day @click="randomizeMemeOfDay">Meme of the day: {{ memeOfDay.title }}</button>
        <p class="font-mono text-xs font-bold uppercase tracking-[0.16em]">😂 {{ totalReactions }} local laughs</p>
      </div>
    </section>

    <section class="px-4 py-10 md:px-8 md:py-14" data-meme-section>
      <div class="grid auto-rows-auto grid-cols-1 gap-6 md:grid-cols-3" data-meme-grid>
        <article v-for="meme in orderedMemes" :key="meme.id" :class="[cardStyle({ size: meme.size, accent: meme.accent }), meme.rotationClass]" data-meme-card>
          <div class="mb-4 flex items-start justify-between gap-3">
            <span :class="accentStickerStyle({ accent: meme.accent })">{{ meme.eyebrow }}</span>
            <button :class="reactionButtonStyle()" :aria-label="`Laugh at ${meme.title}`" @click="addReaction(meme.id)">😂 {{ reactionCounts[meme.id] || 0 }}</button>
          </div>

          <div v-if="meme.format === 'drake'" class="grid gap-3">
            <div class="grid grid-cols-[7rem_1fr] overflow-hidden border-[3px] border-ink">
              <div class="grid place-items-center bg-ink font-meme text-5xl text-paper">NAH</div>
              <div class="bg-paper p-4 font-display text-3xl font-black uppercase leading-none">{{ meme.items?.[0] }}</div>
            </div>
            <div class="grid grid-cols-[7rem_1fr] overflow-hidden border-[3px] border-ink">
              <div class="grid place-items-center bg-[#C6FF3D] font-meme text-5xl text-ink">YEAH</div>
              <div class="bg-paper p-4 font-display text-3xl font-black uppercase leading-none">{{ meme.secondaryItems?.[1] }}</div>
            </div>
          </div>

          <div v-else-if="meme.format === 'brain'" class="grid gap-2">
            <div v-for="(item, itemIndex) in meme.items" :key="item" class="grid grid-cols-[5rem_1fr] items-center border-[3px] border-ink bg-paper">
              <div class="grid h-20 place-items-center font-display text-4xl font-black" :class="itemIndex === 3 ? 'bg-[#C6FF3D]' : 'bg-violet-100'">🧠</div>
              <p class="p-3 font-mono text-xs font-bold uppercase tracking-[0.12em]">{{ item }}</p>
            </div>
          </div>

          <div v-else-if="meme.format === 'starter'" class="grid grid-cols-2 gap-3">
            <div v-for="item in meme.items" :key="item" class="grid min-h-28 place-items-center border-[3px] border-ink bg-[#C6FF3D] p-3 text-center font-mono text-xs font-bold uppercase tracking-[0.12em] shadow-[4px_4px_0_#151417]">{{ item }}</div>
          </div>

          <div v-else-if="meme.format === 'tier'" class="grid gap-2">
            <div v-for="item in meme.items" :key="item" class="grid grid-cols-[4rem_1fr] overflow-hidden border-[3px] border-ink">
              <span class="grid place-items-center bg-violet-500 font-display text-3xl font-black text-paper">{{ item.slice(0, 1) }}</span>
              <span class="bg-paper p-3 font-mono text-xs font-bold uppercase tracking-[0.12em]">{{ item }}</span>
            </div>
          </div>

          <div v-else-if="meme.format === 'dialog'" class="overflow-hidden border-[3px] border-ink bg-[#d9d9d9] shadow-[5px_5px_0_#151417]">
            <div class="bg-violet-500 px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-paper">System message</div>
            <div class="p-5">
              <p class="font-display text-3xl font-black uppercase leading-none">{{ meme.title }}</p>
              <p class="mt-4 text-sm leading-tight text-ink">{{ meme.punchline }}</p>
              <div class="mt-5 flex flex-wrap gap-2">
                <span v-for="item in meme.items" :key="item" class="border-2 border-ink bg-paper px-4 py-2 font-mono text-xs font-bold uppercase">{{ item }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="meme.format === 'fire'" class="relative min-h-56 border-[3px] border-ink bg-[#C6FF3D] p-4">
            <div class="absolute bottom-0 left-6 text-8xl">🔥</div>
            <div class="absolute bottom-0 right-6 text-8xl">🔥</div>
            <p class="relative z-10 font-meme text-5xl uppercase leading-none text-paper [text-shadow:3px_3px_0_#151417]">{{ meme.title }}</p>
          </div>

          <div v-else-if="meme.format === 'jira'" class="border-[3px] border-ink bg-paper">
            <div class="border-b-[3px] border-ink bg-[#C6FF3D] p-3 font-mono text-xs font-bold uppercase">Jira, emotionally</div>
            <div class="p-4">
              <p class="font-display text-4xl font-black uppercase leading-none">{{ meme.title }}</p>
              <p v-for="item in meme.items" :key="item" class="mt-3 border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-[0.12em]">{{ item }}</p>
            </div>
          </div>

          <div v-else-if="meme.format === 'terminal' || meme.format === 'npm'" class="rounded-none border-[3px] border-ink bg-ink p-4 font-mono text-sm leading-7 text-[#C6FF3D] shadow-[5px_5px_0_#6D3BFF]">
            <p>$ {{ meme.format === "npm" ? "pnpm release:cvc" : "git status --emotional" }}</p>
            <p v-for="item in meme.items" :key="item">✓ {{ item }}</p>
            <p class="text-paper">{{ meme.punchline }}</p>
          </div>

          <div v-else-if="meme.format === 'expectation'" class="grid gap-3 md:grid-cols-2">
            <div class="border-[3px] border-ink bg-paper p-4">
              <p class="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted">Expectation</p>
              <p class="mt-3 font-display text-3xl font-black uppercase leading-none">{{ meme.items?.[0] }}</p>
            </div>
            <div class="border-[3px] border-ink bg-[#C6FF3D] p-4">
              <p class="font-mono text-xs font-bold uppercase tracking-[0.16em]">Reality</p>
              <p class="mt-3 font-display text-3xl font-black uppercase leading-none">{{ meme.secondaryItems?.[0] }}</p>
            </div>
          </div>

          <div v-else-if="meme.format === 'buttons'" class="grid gap-4">
            <div class="mx-auto h-24 w-24 rounded-full border-[3px] border-ink bg-violet-500 text-center text-6xl shadow-hard">😰</div>
            <div class="grid gap-3 md:grid-cols-2">
              <button v-for="item in meme.items" :key="item" class="border-[3px] border-ink bg-paper px-4 py-5 font-mono text-xs font-bold uppercase tracking-[0.12em] shadow-[4px_4px_0_#151417]">{{ item }}</button>
            </div>
          </div>

          <div v-else-if="meme.format === 'pigeon'" class="grid gap-4">
            <div class="grid min-h-40 place-items-center border-[3px] border-ink bg-[#C6FF3D] text-8xl">📈</div>
            <p class="font-meme text-5xl uppercase leading-none text-paper [text-shadow:3px_3px_0_#151417]">{{ meme.title }}</p>
          </div>

          <div v-else-if="meme.format === 'tweet' || meme.format === 'slack'" class="rounded-[2rem] border-[3px] border-ink bg-paper p-5 shadow-[5px_5px_0_#151417]">
            <p class="font-mono text-xs font-bold uppercase tracking-[0.16em] text-violet-700">@handover_bot</p>
            <p class="mt-4 text-2xl font-bold leading-tight">{{ meme.title }}</p>
            <p class="mt-4 text-muted">{{ meme.punchline }}</p>
          </div>

          <div v-else-if="meme.format === 'handoff'" class="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div class="grid min-h-40 place-items-center border-[3px] border-ink bg-violet-500 font-display text-8xl font-black text-paper shadow-hard">U</div>
            <div class="font-hand text-5xl text-violet-700">handoff</div>
            <div class="grid min-h-40 place-items-center border-[3px] border-ink bg-ink font-display text-8xl font-black text-paper shadow-hard">S</div>
          </div>

          <div v-else-if="meme.format === 'approval'" class="grid min-h-52 place-items-center border-[3px] border-ink bg-[#C6FF3D] p-4 text-center">
            <p class="font-display text-6xl font-black uppercase leading-none">Approved ✅</p>
          </div>

          <div v-else class="grid min-h-56 place-items-center border-[3px] border-ink bg-violet-500 p-4 text-center">
            <p class="font-meme text-6xl uppercase leading-none text-paper [text-shadow:3px_3px_0_#151417]">{{ meme.title }}</p>
          </div>

          <div class="mt-5">
            <h2 class="font-display text-[clamp(2rem,4vw,4rem)] font-black uppercase leading-[0.85] tracking-[-0.05em]">{{ meme.title }}</h2>
            <p class="mt-3 text-base leading-tight text-muted">{{ meme.punchline }}</p>
            <div v-if="meme.hiddenPunchline" class="mt-4">
              <button :class="revealButtonStyle()" @click="toggleReveal(meme.id)">Reveal punchline</button>
              <p v-if="revealedMemeIds.includes(meme.id)" class="mt-3 rotate-[-1deg] border-[3px] border-ink bg-[#C6FF3D] p-3 font-hand text-3xl leading-none">{{ meme.hiddenPunchline }}</p>
            </div>
            <NuxtLink :to="meme.realLink" class="mt-5 inline-flex rounded-full border-2 border-ink bg-paper px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] shadow-[3px_3px_0_#151417] transition hover:-translate-y-1">the real info →</NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <section class="relative border-t-[3px] border-ink bg-violet-500 px-4 py-14 text-paper md:px-8" data-meme-final>
      <div v-if="acceptanceConfetti" class="pointer-events-none absolute inset-0 overflow-hidden">
        <span v-for="confettiIndex in 32" :key="confettiIndex" class="absolute h-3 w-3 border-2 border-ink bg-[#C6FF3D]" :style="{ left: `${(confettiIndex * 13) % 100}%`, top: `${(confettiIndex * 29) % 100}%`, transform: `rotate(${confettiIndex * 17}deg)` }" />
      </div>
      <p class="font-mono text-xs font-bold uppercase tracking-[0.28em]">final boss</p>
      <h2 class="mt-4 max-w-5xl font-display text-[clamp(3.5rem,10vw,10rem)] font-black uppercase leading-[0.78] tracking-[-0.07em]">I accept the handover.</h2>
      <p class="mt-5 max-w-2xl text-xl leading-tight text-paper/85">Brave. Beautiful. Slightly concerning. The checklist has the boring truth.</p>
      <div class="mt-8 flex flex-wrap gap-4">
        <NuxtLink to="/checklist" class="rounded-full border-[3px] border-ink bg-[#C6FF3D] px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink shadow-hard transition hover:-translate-y-1" data-accept-handover @click.prevent="acceptHandover">I accept the handover →</NuxtLink>
        <NuxtLink to="/docs/aida-architecture" class="rounded-full border-[3px] border-ink bg-paper px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink shadow-hard transition hover:-translate-y-1">Explore the grown-up docs →</NuxtLink>
      </div>
    </section>
  </main>
</template>
