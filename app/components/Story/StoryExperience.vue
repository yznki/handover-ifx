<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import HeroObject from "~/components/Story/HeroObject.client.vue";
import StatCounter from "~/components/Story/StatCounter.vue";
import { useReducedMotion } from "~/composables/useReducedMotion/useReducedMotion";
import { useStoryProgress } from "~/composables/useStoryProgress/useStoryProgress";

/**
 * Story document fields used by the chapter renderer.
 */
interface StoryDocument {
  /**
   * Content path.
   */
  path: string;

  /**
   * Chapter title.
   */
  title: string;

  /**
   * Chapter identifier.
   */
  chapter?: string;

  /**
   * Display order.
   */
  order?: number;

  /**
   * Handwritten margin note.
   */
  note?: string;

  /**
   * Deep-link list.
   */
  links?: Array<{ label: string; to: string }>;
}

const { data: storyDocuments } = await useAsyncData("story-documents", () => queryCollection("documents").where("path", "LIKE", "/story/%").order("order", "ASC").all());
const { prefersReducedMotion } = useReducedMotion();
const { lastChapterPath, hasProgress, rememberChapter } = useStoryProgress();

const heroObject = ref<InstanceType<typeof HeroObject> | null>(null);
const resolvedStoryDocuments = computed<StoryDocument[]>(() => (storyDocuments.value || []) as StoryDocument[]);
const continueHref = computed<string>(() => lastChapterPath.value ? `#${lastChapterPath.value.replace("/story/", "chapter-")}` : "#chapter-00-hero");

/**
 * Scrolls to the saved chapter.
 */
function continueStory(): void {
  const targetElement = document.querySelector(continueHref.value);
  if (!targetElement) return;
  targetElement.scrollIntoView({ behavior: prefersReducedMotion.value ? "auto" : "smooth", block: "start" });
}

/**
 * Initializes scroll-linked motion when allowed by user preference.
 */
async function initializeMotion(): Promise<void> {
  if (prefersReducedMotion.value) return;
  const gsapModule = await import("gsap");
  const scrollTriggerModule = await import("gsap/ScrollTrigger");
  const lenisModule = await import("lenis");
  const gsap = gsapModule.default;
  const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
  const Lenis = lenisModule.default;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time: number) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.create({
    trigger: "#story-track",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (scrollTrigger) => heroObject.value?.setShapeProgress(scrollTrigger.progress)
  });
}

onMounted(async () => {
  await initializeMotion();
});
</script>

<template>
  <main id="story-track" class="pt-24">
    <section class="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1600px] items-center gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8">
      <div data-reveal>
        <p class="font-mono text-xs uppercase tracking-[0.28em] text-violet-700">00 / Hero</p>
        <h1 class="mt-5 max-w-5xl text-[clamp(4.2rem,13vw,13rem)] font-black leading-[0.78] tracking-[-0.09em]">
          The handover I wish I could scroll through.
        </h1>
        <p class="mt-8 max-w-2xl text-xl leading-8 text-muted md:text-2xl">
          I built this as one clean place for the facts, the context, the runbooks, and the small things that usually disappear when someone leaves.
        </p>
        <div class="mt-10 flex flex-wrap gap-3">
          <button v-if="hasProgress" class="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-paper transition hover:bg-violet-700" @click="continueStory">
            Continue the story
          </button>
          <NuxtLink to="/docs/aida-architecture" class="rounded-full border border-ink/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-ink transition hover:border-violet-500 hover:text-violet-700">
            Dive into reference docs
          </NuxtLink>
        </div>
      </div>
      <ClientOnly>
        <HeroObject ref="heroObject" />
        <template #fallback>
          <div class="grid h-[34rem] place-items-center rounded-[2.5rem] border border-ink/10 bg-violet-50 text-8xl font-black tracking-[-0.08em] text-violet-700">Y</div>
        </template>
      </ClientOnly>
    </section>

    <section class="mx-auto grid max-w-[1600px] gap-4 px-4 py-16 md:grid-cols-4 md:px-8">
      <StatCounter :value="24" label="CVC component categories" />
      <StatCounter :value="62" label="CVC component folders" />
      <StatCounter :value="48" label="Planning tickets" />
      <StatCounter :value="13" label="Planning epics" />
    </section>

    <section class="mx-auto max-w-[1600px] px-4 py-12 md:px-8">
      <div class="grid gap-5 md:grid-cols-3">
        <figure v-for="screen in ['aida', 'aida-demo', 'aida-planning', 'common-vue-components', 'common-vue-components-demo']" :key="screen" class="rounded-[2rem] border border-ink/10 bg-ink p-3 shadow-editorial">
          <div class="mb-3 flex gap-1.5 px-2 pt-1">
            <span class="h-2.5 w-2.5 rounded-full bg-violet-500" />
            <span class="h-2.5 w-2.5 rounded-full bg-violet-400" />
            <span class="h-2.5 w-2.5 rounded-full bg-violet-100" />
          </div>
          <img :src="`/screens/${screen}.png`" :alt="`${screen} screenshot`" class="aspect-[16/10] w-full rounded-[1.4rem] object-cover" @error="($event.target as HTMLImageElement).src = '/screens/placeholder.svg'" />
          <figcaption class="px-2 py-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-paper/70">{{ screen.replaceAll("-", " ") }}</figcaption>
        </figure>
      </div>
    </section>

    <section v-for="document in resolvedStoryDocuments" :id="`chapter-${document.chapter || document.path.replace('/story/', '')}`" :key="document.path" data-reveal class="mx-auto grid min-h-screen max-w-[1600px] gap-10 border-t border-ink/10 px-4 py-24 md:grid-cols-[0.72fr_1.28fr_0.5fr] md:px-8">
      <div class="md:sticky md:top-28 md:self-start">
        <p class="font-mono text-xs uppercase tracking-[0.28em] text-violet-700">{{ document.chapter }}</p>
        <h2 class="mt-4 text-[clamp(2.8rem,7vw,7rem)] font-black leading-[0.84] tracking-[-0.08em]">{{ document.title }}</h2>
      </div>
      <article class="content-prose max-w-3xl" @mouseenter="rememberChapter(document.path)">
        <ContentRenderer :value="document" />
        <div v-if="document.links && document.links.length > 0" class="mt-12 flex flex-wrap gap-3 border-t border-ink/10 pt-8">
          <NuxtLink v-for="link in document.links" :key="link.to" :to="link.to" class="rounded-full bg-violet-500 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-paper no-underline transition hover:bg-violet-700">
            Dive deeper → {{ link.label }}
          </NuxtLink>
        </div>
      </article>
      <aside v-if="document.note" class="font-hand text-3xl leading-8 text-violet-700 md:sticky md:top-32 md:self-start">
        {{ document.note }}
      </aside>
    </section>
  </main>
</template>
