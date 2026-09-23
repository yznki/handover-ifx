<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import HeroObject from "~/components/Story/HeroObject.client.vue";
import StatCounter from "~/components/Story/StatCounter.vue";
import StoryBeatVisual from "~/components/Story/StoryBeatVisual.vue";
import { useReducedMotion } from "~/composables/useReducedMotion/useReducedMotion";
import { useStoryProgress } from "~/composables/useStoryProgress/useStoryProgress";

/**
 * A structured story beat.
 */
interface StoryBeat {
  /**
   * Primary beat statement.
   */
  statement: string;

  /**
   * Optional supporting sentence.
   */
  support?: string;

  /**
   * Optional handwritten note.
   */
  note?: string;

  /**
   * Visual treatment identifier.
   */
  visual?: string;
}

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
   * Chapter note.
   */
  note?: string;

  /**
   * Structured beat list.
   */
  beats?: StoryBeat[];

  /**
   * Deep-link list.
   */
  links?: Array<{ label: string; to: string }>;
}

const { data: storyDocuments } = await useAsyncData("story-documents", () => queryCollection("documents").where("path", "LIKE", "/story/%").order("order", "ASC").all());
const { prefersReducedMotion } = useReducedMotion();
const { lastChapterPath, hasProgress, rememberChapter } = useStoryProgress();

const heroObject = ref<InstanceType<typeof HeroObject> | null>(null);
const floatingHeroObject = ref<InstanceType<typeof HeroObject> | null>(null);
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
 * Initializes chapter-linked motion when allowed by user preference.
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
    onUpdate: (scrollTrigger) => {
      heroObject.value?.setShapeProgress(scrollTrigger.progress);
      floatingHeroObject.value?.setShapeProgress(scrollTrigger.progress);
    }
  });
  gsap.utils.toArray<HTMLElement>("[data-beat]").forEach((element) => {
    const lines = element.querySelectorAll("[data-kinetic-line]");
    gsap.fromTo(lines, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: element, start: "top 65%", end: "top 20%", scrub: 0.6 } });
  });
}

onMounted(async () => {
  await initializeMotion();
});
</script>

<template>
  <main id="story-track" class="bg-paper pt-24">
    <ClientOnly>
      <div class="pointer-events-none fixed bottom-7 right-8 z-30 hidden w-[18rem] opacity-55 mix-blend-multiply motion-reduce:hidden md:block">
        <HeroObject ref="floatingHeroObject" floating />
      </div>
    </ClientOnly>

    <section id="chapter-00-hero" class="relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1600px] items-center gap-10 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:px-8">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.28em] text-violet-700">00 / Hero</p>
        <h1 class="mt-5 max-w-5xl overflow-hidden text-[clamp(4.2rem,13vw,13rem)] font-black leading-[0.78] tracking-[-0.09em]">
          <span data-kinetic-line class="block">The</span>
          <span data-kinetic-line class="block">handover</span>
          <span data-kinetic-line class="block">I wish</span>
          <span data-kinetic-line class="block">could scroll.</span>
        </h1>
        <p class="mt-8 max-w-2xl text-xl leading-8 text-muted md:text-2xl">Facts stay grounded. Story stays cinematic. Docs carry the depth.</p>
        <div class="mt-10 flex flex-wrap gap-3">
          <button v-if="hasProgress" class="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-paper transition hover:bg-violet-700" @click="continueStory">Continue the story</button>
          <NuxtLink to="/docs/aida-architecture" class="rounded-full border border-ink/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-ink transition hover:border-violet-500 hover:text-violet-700">Dive into reference docs</NuxtLink>
        </div>
      </div>
      <ClientOnly>
        <HeroObject ref="heroObject" />
        <template #fallback><div class="grid h-[34rem] place-items-center rounded-[2.5rem] border border-ink/10 bg-violet-50 text-8xl font-black tracking-[-0.08em] text-violet-700">Y</div></template>
      </ClientOnly>
    </section>

    <section class="mx-auto grid max-w-[1600px] gap-4 px-4 py-16 md:grid-cols-4 md:px-8">
      <StatCounter :value="24" label="CVC component categories" />
      <StatCounter :value="62" label="CVC component folders" />
      <StatCounter :value="48" label="Planning tickets" />
      <StatCounter :value="13" label="Planning epics" />
    </section>

    <section class="mx-auto max-w-[1600px] px-4 py-12 md:px-8">
      <div class="grid gap-5 md:grid-cols-5">
        <figure v-for="screen in ['aida', 'aida-demo', 'aida-planning', 'common-vue-components', 'common-vue-components-demo']" :key="screen" class="rounded-[2rem] border border-ink/10 bg-ink p-3 shadow-editorial">
          <div class="mb-3 flex gap-1.5 px-2 pt-1"><span class="h-2.5 w-2.5 rounded-full bg-violet-500" /><span class="h-2.5 w-2.5 rounded-full bg-violet-400" /><span class="h-2.5 w-2.5 rounded-full bg-violet-100" /></div>
          <img :src="`/screens/${screen}.png`" :alt="`${screen} screenshot`" class="aspect-[16/10] w-full rounded-[1.4rem] object-cover" @error="($event.target as HTMLImageElement).src = '/screens/placeholder.svg'" />
          <figcaption class="px-2 py-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-paper/70">{{ screen.replaceAll("-", " ") }}</figcaption>
        </figure>
      </div>
    </section>

    <section v-for="document in resolvedStoryDocuments" :id="`chapter-${document.chapter || document.path.replace('/story/', '')}`" :key="document.path" class="border-t border-ink/10" @mouseenter="rememberChapter(document.path)">
      <div class="mx-auto grid max-w-[1600px] gap-8 px-4 py-16 md:grid-cols-[0.5fr_1.5fr] md:px-8">
        <div class="md:sticky md:top-28 md:self-start">
          <p class="font-mono text-xs uppercase tracking-[0.28em] text-violet-700">{{ document.chapter }}</p>
          <h2 class="mt-4 text-[clamp(2.8rem,7vw,7rem)] font-black leading-[0.84] tracking-[-0.08em]">{{ document.title }}</h2>
          <p v-if="document.note" class="mt-8 font-hand text-3xl leading-8 text-violet-700">{{ document.note }}</p>
        </div>
        <div>
          <article v-for="(beat, beatIndex) in document.beats || []" :key="`${document.path}-${beatIndex}`" data-beat class="grid min-h-screen items-center gap-8 py-12 md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p class="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-violet-700">{{ document.chapter }} · {{ String(beatIndex + 1).padStart(2, "0") }}</p>
              <h3 class="mt-5 overflow-hidden text-[clamp(3.3rem,7.8vw,8.6rem)] font-black leading-[0.82] tracking-[-0.09em]">
                <span v-for="(line, lineIndex) in beat.statement.split(' ')" :key="`${beat.statement}-${line}-${lineIndex}`" data-kinetic-line class="mr-4 inline-block">{{ line }}</span>
              </h3>
              <p v-if="beat.support" class="mt-8 max-w-2xl text-xl leading-8 text-muted md:text-2xl">{{ beat.support }}</p>
              <p v-if="beat.note" class="mt-8 font-hand text-4xl leading-10 text-violet-700">{{ beat.note }}</p>
            </div>
            <StoryBeatVisual :visual="beat.visual" :chapter="document.chapter" />
          </article>
          <div v-if="document.links && document.links.length > 0" class="flex min-h-[40vh] flex-wrap items-center justify-center gap-3 border-t border-ink/10 py-16">
            <NuxtLink v-for="link in document.links" :key="link.to" :to="link.to" class="rounded-full bg-violet-500 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-paper no-underline transition hover:bg-violet-700">Dive deeper → {{ link.label }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
