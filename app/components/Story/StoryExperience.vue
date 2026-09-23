<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { cva } from "class-variance-authority";
import HeroObject from "~/components/Story/HeroObject.client.vue";
import StoryToy from "~/components/Story/StoryToy.vue";
import { useReducedMotion } from "~/composables/useReducedMotion/useReducedMotion";
import { useStoryProgress } from "~/composables/useStoryProgress/useStoryProgress";
import type { ComponentPublicInstance } from "vue";

/**
 * Short story toy configuration.
 */
interface StoryToyConfiguration {
  /**
   * Toy type.
   */
  type: string;

  /**
   * Link label.
   */
  linkLabel?: string;

  /**
   * Link route.
   */
  linkTo?: string;

  /**
   * Optional toy labels.
   */
  items?: string[];
}

/**
 * Trailer screen document fields.
 */
interface StoryScreenDocument {
  /**
   * Content path.
   */
  path: string;

  /**
   * Short title.
   */
  title: string;

  /**
   * Two-digit chapter label.
   */
  chapter?: string;

  /**
   * Display order.
   */
  order?: number;

  /**
   * Main screen line.
   */
  headline?: string;

  /**
   * Small supporting line.
   */
  subline?: string;

  /**
   * Toy configuration.
   */
  toy?: StoryToyConfiguration;
}

const dotButtonStyle = cva("h-3 w-3 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-violet-500", {
  variants: {
    active: {
      true: "scale-125 border-violet-500 bg-violet-500 shadow-violet",
      false: "border-ink/20 bg-paper hover:border-violet-500"
    }
  }
});

const { data: storyDocuments } = await useAsyncData("story-trailer-documents", () => queryCollection("documents").where("path", "LIKE", "/story/%").order("order", "ASC").all());
const { prefersReducedMotion } = useReducedMotion();
const { lastChapterPath, hasProgress, rememberChapter } = useStoryProgress();

const floatingHeroObject = ref<InstanceType<typeof HeroObject> | null>(null);
const screenObserver = ref<IntersectionObserver | null>(null);
const activeScreenIndex = ref<number>(0);
const screenElements = ref<HTMLElement[]>([]);

const storyScreens = computed<StoryScreenDocument[]>(() => ([...((storyDocuments.value || []) as StoryScreenDocument[])]).sort((firstScreen, secondScreen) => (firstScreen.order || 0) - (secondScreen.order || 0)));
const progressPercentage = computed<number>(() => storyScreens.value.length <= 1 ? 0 : (activeScreenIndex.value / (storyScreens.value.length - 1)) * 100);
const savedScreenIndex = computed<number>(() => {
  const matchingIndex = storyScreens.value.findIndex((screen) => screen.path === lastChapterPath.value);
  return matchingIndex >= 0 ? matchingIndex : 0;
});

/**
 * Assigns screen references from the template.
 * @param element - Screen element or component ref.
 * @param screenIndex - Screen index.
 */
function setScreenElement(element: Element | null, screenIndex: number): void {
  if (!(element instanceof HTMLElement)) return;
  screenElements.value[screenIndex] = element;
}

/**
 * Creates a typed template ref callback for a screen.
 * @param screenIndex - Screen index.
 * @returns Template ref callback.
 */
function getScreenElementSetter(screenIndex: number): (element: Element | ComponentPublicInstance | null) => void {
  return (element: Element | ComponentPublicInstance | null) => {
    setScreenElement(element instanceof Element ? element : null, screenIndex);
  };
}

/**
 * Scrolls to a trailer screen.
 * @param screenIndex - Destination screen index.
 */
function goToScreen(screenIndex: number): void {
  const screenElement = screenElements.value[screenIndex];
  if (!screenElement) return;
  screenElement.scrollIntoView({ behavior: prefersReducedMotion.value ? "auto" : "smooth", block: "start" });
}

/**
 * Starts the trailer from the second screen.
 */
function startTrailer(): void {
  goToScreen(1);
}

/**
 * Moves to the next trailer screen.
 */
function goToNextScreen(): void {
  goToScreen(Math.min(storyScreens.value.length - 1, activeScreenIndex.value + 1));
}

/**
 * Replays the trailer from the beginning.
 */
function replayTrailer(): void {
  goToScreen(0);
}

/**
 * Continues from persisted story progress.
 */
function continueTrailer(): void {
  goToScreen(savedScreenIndex.value);
}

/**
 * Updates the object shape and persisted progress.
 * @param screenIndex - Active screen index.
 */
function setActiveScreen(screenIndex: number): void {
  activeScreenIndex.value = screenIndex;
  floatingHeroObject.value?.setShapeProgress(storyScreens.value.length <= 1 ? 0 : screenIndex / (storyScreens.value.length - 1));
  const activeScreen = storyScreens.value[screenIndex];
  if (!activeScreen) return;
  rememberChapter(activeScreen.path);
}

/**
 * Updates the particle object from pointer position.
 * @param pointerEvent - Pointer event.
 */
function updatePointerPosition(pointerEvent: PointerEvent): void {
  const horizontalPosition = (pointerEvent.clientX / window.innerWidth) * 2 - 1;
  const verticalPosition = (pointerEvent.clientY / window.innerHeight) * 2 - 1;
  floatingHeroObject.value?.setPointerPosition(horizontalPosition, verticalPosition);
}

/**
 * Initializes screen observation.
 */
async function initializeScreens(): Promise<void> {
  await nextTick();
  screenObserver.value?.disconnect();
  screenObserver.value = new IntersectionObserver((entries) => {
    const visibleEntry = entries.sort((firstEntry, secondEntry) => secondEntry.intersectionRatio - firstEntry.intersectionRatio)[0];
    if (!visibleEntry?.isIntersecting) return;
    const screenIndex = Number((visibleEntry.target as HTMLElement).dataset.screenIndex || "0");
    setActiveScreen(screenIndex);
  }, { threshold: [0.55, 0.7] });
  screenElements.value.forEach((screenElement) => {
    screenObserver.value?.observe(screenElement);
  });
}

onMounted(async () => {
  await initializeScreens();
  floatingHeroObject.value?.setShapeProgress(0);
});

onBeforeUnmount(() => {
  screenObserver.value?.disconnect();
});
</script>

<template>
  <main class="relative min-h-screen overflow-x-hidden bg-paper pt-16" @pointermove="updatePointerPosition">
    <ClientOnly>
      <div class="pointer-events-none fixed inset-0 z-0 opacity-25 mix-blend-multiply motion-reduce:hidden">
        <HeroObject ref="floatingHeroObject" floating interactive />
      </div>
    </ClientOnly>

    <div class="fixed left-0 right-0 top-0 z-50 h-1 bg-ink/10">
      <div class="h-full bg-violet-500 transition-all duration-500" :style="{ width: `${progressPercentage}%` }" />
    </div>

    <nav class="fixed left-4 right-4 top-4 z-50 flex items-center justify-between gap-4 rounded-full border border-ink/10 bg-paper/75 px-4 py-3 backdrop-blur md:left-8 md:right-8">
      <button v-if="hasProgress" class="hidden rounded-full bg-ink px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper transition hover:bg-violet-700 md:block" @click="continueTrailer">Continue</button>
      <NuxtLink v-else to="/docs/aida-architecture" class="hidden rounded-full bg-ink px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-paper transition hover:bg-violet-700 md:block">Explore</NuxtLink>
      <div class="mx-auto flex items-center gap-3">
        <button v-for="(screen, screenIndex) in storyScreens" :key="screen.path" :class="dotButtonStyle({ active: activeScreenIndex === screenIndex })" :aria-label="`Go to ${screen.title}`" @click="goToScreen(screenIndex)" />
      </div>
      <NuxtLink to="/docs/aida-architecture" class="rounded-full border border-ink/10 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink transition hover:border-violet-500 hover:text-violet-700">Explore</NuxtLink>
    </nav>

    <section v-for="(screen, screenIndex) in storyScreens" :id="`story-screen-${screen.order || screenIndex}`" :key="screen.path" :ref="getScreenElementSetter(screenIndex)" :data-screen-index="screenIndex" data-story-screen class="relative z-10 grid min-h-screen scroll-mt-0 grid-rows-[auto_minmax(0,1fr)] gap-4 px-4 pb-5 pt-24 md:px-8 md:pb-6 md:pt-24">
      <div class="grid min-h-0 gap-4 md:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)] md:items-end">
        <div class="min-w-0">
          <p class="font-mono text-xs uppercase tracking-[0.28em] text-violet-700">{{ screen.chapter }} / {{ screen.title }}</p>
          <h1 class="mt-3 max-w-[12ch] text-[clamp(3.3rem,8.8vw,8.8rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-ink md:max-w-[10.5ch]">
            {{ screen.headline }}
          </h1>
        </div>
        <div class="min-w-0 md:pb-5">
          <p class="max-w-2xl text-[clamp(1.05rem,2vw,1.75rem)] leading-tight text-muted">{{ screen.subline }}</p>
          <NuxtLink v-if="screen.toy?.linkTo" :to="screen.toy.linkTo" class="mt-5 inline-flex rounded-full bg-violet-500 px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-paper transition hover:bg-violet-700">
            {{ screen.toy.linkLabel || "the real version" }} →
          </NuxtLink>
        </div>
      </div>
      <StoryToy :toy="screen.toy" :order="screen.order || screenIndex" @start="startTrailer" @next="goToNextScreen" @replay="replayTrailer" />
    </section>
  </main>
</template>
