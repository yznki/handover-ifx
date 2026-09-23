<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { cva } from "class-variance-authority";
import { useReducedMotion } from "~/composables/useReducedMotion/useReducedMotion";

/**
 * Editable toy configuration from story content.
 */
interface StoryToyConfiguration {
  /**
   * Toy type identifier.
   */
  type: string;

  /**
   * Link label shown below the toy.
   */
  linkLabel?: string;

  /**
   * Documentation route for the toy.
   */
  linkTo?: string;

  /**
   * Optional item labels.
   */
  items?: string[];
}

/**
 * Story toy properties.
 */
interface StoryToyProperties {
  /**
   * Toy configuration.
   */
  toy?: StoryToyConfiguration;

  /**
   * Current screen order.
   */
  order: number;
}

/**
 * Repository node state.
 */
interface RepositoryNode {
  /**
   * Stable node key.
   */
  key: string;

  /**
   * Visible node label.
   */
  label: string;

  /**
   * Horizontal position in percent.
   */
  x: number;

  /**
   * Vertical position in percent.
   */
  y: number;

  /**
   * Tooltip text.
   */
  description: string;

  /**
   * Visual group.
   */
  group: "aida" | "cvc" | "valibridge" | "archive";
}

/**
 * Repository connection state.
 */
interface RepositoryConnection {
  /**
   * Source node key.
   */
  from: string;

  /**
   * Target node key.
   */
  to: string;
}

/**
 * Quiz answer option.
 */
interface QuizOption {
  /**
   * Button label.
   */
  label: string;

  /**
   * Whether this option is the documented answer.
   */
  correct: boolean;

  /**
   * Reveal copy.
   */
  reveal: string;
}

/**
 * Quiz question.
 */
interface QuizQuestion {
  /**
   * Scenario label.
   */
  scenario: string;

  /**
   * Available answer options.
   */
  options: QuizOption[];
}

/**
 * Toy events.
 */
interface StoryToyEmits {
  /**
   * Starts the story by scrolling to the next screen.
   */
  start: [];

  /**
   * Replays the story from the first screen.
   */
  replay: [];

  /**
   * Skips to the next story screen.
   */
  next: [];
}

const properties = withDefaults(defineProps<StoryToyProperties>(), {
  toy: () => ({ type: "hero" })
});
const emit = defineEmits<StoryToyEmits>();

const { prefersReducedMotion } = useReducedMotion();

const selectedQuizAnswers = ref<Record<number, number>>({});
const clearedFlags = ref<string[]>([]);
const hoveredRepositoryKey = ref<string>("cvc");
const activeRepositoryKey = ref<string>("");
const fileDropped = ref<boolean>(false);
const activePipelineBranch = ref<"develop" | "master">("develop");
const pipelineRunning = ref<boolean>(false);
const completedPipelineStages = ref<string[]>([]);
const terminalLines = ref<string[]>(["$ waiting for courage"]);
const monolithBroken = ref<boolean>(false);
const timeoutHandles = ref<number[]>([]);

const quizQuestions: QuizQuestion[] = [
  {
    scenario: "Bug in a client. Root cause lives in CVC.",
    options: [
      { label: "Patch the client and sprint away", correct: false, reveal: "Tempting. Also how ghosts get into repos." },
      { label: "Fix upstream in CVC", correct: true, reveal: "Correct. One fix, fewer future mysteries." }
    ]
  },
  {
    scenario: "Friday deadline. Reality has chosen violence.",
    options: [
      { label: "Ship quick, imperfect, then clean", correct: true, reveal: "Correct. Deadline survives; cleanup still has a name." },
      { label: "Polish forever", correct: false, reveal: "Beautiful. Also late." },
      { label: "Pretend time is a feature flag", correct: false, reveal: "Sadly, no environment variable for Monday." }
    ]
  },
  {
    scenario: "You disagree with someone senior.",
    options: [
      { label: "Whoever makes more sense wins", correct: true, reveal: "Correct. Logic gets the merge request." },
      { label: "Win by volume", correct: false, reveal: "Rejected by the invisible linter." }
    ]
  }
];
const defaultFlagItems = ["blind vibe coding", "new packages without research", "god components", "utils dumping ground", "duplicated logic", "abbreviations", "if/else pyramids", "redundant API calls"];
const pipelineStages = ["verify", "build", "semantic-release", "docker push", "oc deploy"];
const repositoryConnections: RepositoryConnection[] = [
  { from: "cvc", to: "valibridge-client" },
  { from: "cvc", to: "lost-client" },
  { from: "cvc", to: "tim-client" },
  { from: "cvc", to: "jira-ai-client" },
  { from: "cvc", to: "instruments-client" },
  { from: "cvc", to: "editable-table" },
  { from: "aida-planning", to: "aida" },
  { from: "valibridge-api", to: "valibridge-client" }
];
const fallbackRepositoryNode: RepositoryNode = { key: "fallback", label: "repo", x: 50, y: 50, description: "Repository node unavailable.", group: "archive" };
const initialRepositoryNodes: RepositoryNode[] = [
  { key: "cvc", label: "CVC", x: 18, y: 48, description: "Shared components. Fix upstream when the root cause lives here.", group: "cvc" },
  { key: "valibridge-client", label: "valibridge-client", x: 48, y: 25, description: "Practical CVC pilot and ValiBridge front end.", group: "valibridge" },
  { key: "lost-client", label: "lost-client", x: 43, y: 45, description: "One of the CVC consumers.", group: "cvc" },
  { key: "tim-client", label: "tim-client", x: 50, y: 65, description: "Another CVC consumer.", group: "cvc" },
  { key: "jira-ai-client", label: "jira-ai-client", x: 66, y: 36, description: "CVC consumer in the map.", group: "cvc" },
  { key: "instruments-client", label: "instruments-client", x: 68, y: 57, description: "CVC consumer in the map.", group: "cvc" },
  { key: "editable-table", label: "editable-table", x: 79, y: 73, description: "Peer-dependency note lives in Explore.", group: "cvc" },
  { key: "aida-planning", label: "aida-planning", x: 22, y: 16, description: "Planning memory that points into AIDA.", group: "aida" },
  { key: "aida", label: "AIDA", x: 50, y: 10, description: "Apart from CVC. It does not consume it.", group: "aida" },
  { key: "valibridge-api", label: "valibridge-api", x: 78, y: 20, description: "Back end paired with valibridge-client.", group: "valibridge" },
  { key: "archived", label: "archived Bitbucket", x: 17, y: 82, description: "Greyed out on purpose: old context, not the current path.", group: "archive" }
];
const repositoryNodes = ref<RepositoryNode[]>(initialRepositoryNodes.map((node) => ({ ...node })));

const toyType = computed<string>(() => properties.toy?.type || "hero");
const flagItems = computed<string[]>(() => properties.toy?.items || defaultFlagItems);
const quizAnsweredCount = computed<number>(() => Object.keys(selectedQuizAnswers.value).length);
const quizScore = computed<number>(() => quizQuestions.filter((question, questionIndex) => {
  const answerIndex = selectedQuizAnswers.value[questionIndex];
  return typeof answerIndex === "number" && question.options[answerIndex]?.correct;
}).length);
const allFlagsCleared = computed<boolean>(() => clearedFlags.value.length === flagItems.value.length);
const pipelineComplete = computed<boolean>(() => completedPipelineStages.value.length === pipelineStages.length);
const currentRepositoryDescription = computed<string>(() => repositoryNodes.value.find((node) => node.key === hoveredRepositoryKey.value)?.description || "Focus a node. The map will gossip politely.");

const answerButtonStyle = cva("rounded-full border px-4 py-3 text-left font-mono text-[0.68rem] uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-violet-500 md:text-xs", {
  variants: {
    state: {
      idle: "border-ink/10 bg-paper text-ink hover:border-violet-500 hover:text-violet-700",
      correct: "border-violet-500 bg-violet-500 text-paper shadow-violet",
      incorrect: "border-ink/10 bg-ink/10 text-muted line-through"
    }
  }
});
const flagButtonStyle = cva("rounded-full border px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] transition focus:outline-none focus:ring-2 focus:ring-violet-500 md:text-xs", {
  variants: {
    cleared: {
      true: "border-violet-500 bg-violet-50 text-violet-700 line-through decoration-violet-500 decoration-2",
      false: "border-ink/10 bg-paper text-ink hover:-translate-y-1 hover:border-violet-500"
    }
  }
});
const branchButtonStyle = cva("rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] transition focus:outline-none focus:ring-2 focus:ring-violet-500", {
  variants: {
    active: {
      true: "bg-violet-500 text-paper shadow-violet",
      false: "bg-paper text-ink hover:text-violet-700"
    }
  }
});
const monolithBlockStyle = cva("grid min-h-40 place-items-center rounded-[2rem] border text-center font-mono text-sm uppercase tracking-[0.16em] transition duration-500 focus:outline-none focus:ring-2 focus:ring-violet-500", {
  variants: {
    broken: {
      true: "rotate-[-2deg] border-violet-500 bg-violet-500 text-paper shadow-violet",
      false: "border-ink bg-ink text-paper shadow-editorial hover:scale-[1.02]"
    }
  }
});

/**
 * Emits the start event.
 */
function startStory(): void {
  emit("start");
}

/**
 * Emits the replay event.
 */
function replayStory(): void {
  emit("replay");
}

/**
 * Emits the next event.
 */
function goToNextScreen(): void {
  emit("next");
}

/**
 * Records a quiz answer.
 * @param questionIndex - Question index.
 * @param optionIndex - Option index.
 */
function selectQuizAnswer(questionIndex: number, optionIndex: number): void {
  selectedQuizAnswers.value = { ...selectedQuizAnswers.value, [questionIndex]: optionIndex };
}

/**
 * Resolves the quiz answer button state.
 * @param question - The quiz question.
 * @param questionIndex - Question index.
 * @param optionIndex - Option index.
 * @returns The visual button state.
 */
function getAnswerState(question: QuizQuestion, questionIndex: number, optionIndex: number): "idle" | "correct" | "incorrect" {
  const selectedAnswerIndex = selectedQuizAnswers.value[questionIndex];
  if (typeof selectedAnswerIndex !== "number") return "idle";
  if (question.options[optionIndex]?.correct) return "correct";
  return selectedAnswerIndex === optionIndex ? "incorrect" : "idle";
}

/**
 * Clears or restores one red-flag chip.
 * @param flag - Red-flag label.
 */
function toggleFlag(flag: string): void {
  const flagIsCleared = clearedFlags.value.includes(flag);
  clearedFlags.value = flagIsCleared ? clearedFlags.value.filter((clearedFlag) => clearedFlag !== flag) : [...clearedFlags.value, flag];
}

/**
 * Finds a repository node by key.
 * @param nodeKey - Node key.
 * @returns The matching repository node.
 */
function findRepositoryNode(nodeKey: string): RepositoryNode {
  return repositoryNodes.value.find((node) => node.key === nodeKey) || fallbackRepositoryNode;
}

/**
 * Starts dragging a repository node.
 * @param pointerEvent - Pointer event.
 * @param nodeKey - Node key.
 */
function startRepositoryDrag(pointerEvent: PointerEvent, nodeKey: string): void {
  activeRepositoryKey.value = nodeKey;
  hoveredRepositoryKey.value = nodeKey;
  (pointerEvent.currentTarget as HTMLElement).setPointerCapture(pointerEvent.pointerId);
}

/**
 * Moves the active repository node.
 * @param pointerEvent - Pointer event.
 */
function moveRepositoryNode(pointerEvent: PointerEvent): void {
  if (!activeRepositoryKey.value) return;
  const containerElement = (pointerEvent.currentTarget as HTMLElement).closest("[data-repository-map]");
  if (!(containerElement instanceof HTMLElement)) return;
  const rectangle = containerElement.getBoundingClientRect();
  const nextHorizontalPosition = Math.min(90, Math.max(10, ((pointerEvent.clientX - rectangle.left) / rectangle.width) * 100));
  const nextVerticalPosition = Math.min(88, Math.max(10, ((pointerEvent.clientY - rectangle.top) / rectangle.height) * 100));
  repositoryNodes.value = repositoryNodes.value.map((node) => node.key === activeRepositoryKey.value ? { ...node, x: nextHorizontalPosition, y: nextVerticalPosition } : node);
}

/**
 * Ends repository dragging.
 */
function stopRepositoryDrag(): void {
  activeRepositoryKey.value = "";
}

/**
 * Nudges a focused repository node with arrow keys.
 * @param keyboardEvent - Keyboard event.
 * @param nodeKey - Node key.
 */
function nudgeRepositoryNode(keyboardEvent: KeyboardEvent, nodeKey: string): void {
  const movement = keyboardEvent.key === "ArrowLeft" ? { x: -3, y: 0 } : keyboardEvent.key === "ArrowRight" ? { x: 3, y: 0 } : keyboardEvent.key === "ArrowUp" ? { x: 0, y: -3 } : keyboardEvent.key === "ArrowDown" ? { x: 0, y: 3 } : { x: 0, y: 0 };
  if (movement.x === 0 && movement.y === 0) return;
  keyboardEvent.preventDefault();
  repositoryNodes.value = repositoryNodes.value.map((node) => node.key === nodeKey ? { ...node, x: Math.min(90, Math.max(10, node.x + movement.x)), y: Math.min(88, Math.max(10, node.y + movement.y)) } : node);
}

/**
 * Marks the fake CSV as dropped.
 */
function dropCsvFile(): void {
  fileDropped.value = true;
}

/**
 * Prevents the browser from opening a dragged item.
 * @param dragEvent - Drag event.
 */
function allowCsvDrop(dragEvent: DragEvent): void {
  dragEvent.preventDefault();
}

/**
 * Clears pending pipeline timers.
 */
function clearPipelineTimers(): void {
  timeoutHandles.value.forEach((timeoutHandle) => window.clearTimeout(timeoutHandle));
  timeoutHandles.value = [];
}

/**
 * Runs the fake-but-factual pipeline animation.
 */
function runPipeline(): void {
  clearPipelineTimers();
  pipelineRunning.value = true;
  completedPipelineStages.value = [];
  terminalLines.value = [`$ git push origin ${activePipelineBranch.value}`, `branch=${activePipelineBranch.value}`, activePipelineBranch.value === "develop" ? "release channel: prerelease" : "release channel: stable"];
  const stageDelay = prefersReducedMotion.value ? 0 : 420;
  pipelineStages.forEach((stage, stageIndex) => {
    const timeoutHandle = window.setTimeout(() => {
      completedPipelineStages.value = [...completedPipelineStages.value, stage];
      terminalLines.value = [...terminalLines.value, `✓ ${stage}`];
      pipelineRunning.value = stageIndex < pipelineStages.length - 1;
    }, stageDelay * (stageIndex + 1));
    timeoutHandles.value = [...timeoutHandles.value, timeoutHandle];
  });
}

/**
 * Breaks the monolith toy into package blocks.
 */
function breakMonolith(): void {
  monolithBroken.value = true;
}

/**
 * Starts the hold gesture for the monolith toy.
 */
function startMonolithHold(): void {
  const timeoutHandle = window.setTimeout(() => {
    breakMonolith();
  }, prefersReducedMotion.value ? 0 : 500);
  timeoutHandles.value = [...timeoutHandles.value, timeoutHandle];
}

/**
 * Stops pending hold timers.
 */
function stopMonolithHold(): void {
  clearPipelineTimers();
}

onBeforeUnmount(() => {
  clearPipelineTimers();
});
</script>

<template>
  <div class="relative min-h-[min(45vh,28rem)] rounded-[2rem] border border-ink/10 bg-white/45 p-4 shadow-editorial backdrop-blur md:min-h-[27rem] md:rounded-[3rem] md:p-6" :data-toy="toyType">
    <div v-if="toyType === 'hero'" class="grid h-full min-h-[23rem] place-items-center text-center">
      <button class="group rounded-full bg-ink px-8 py-5 font-mono text-sm uppercase tracking-[0.22em] text-paper shadow-editorial transition hover:-translate-y-1 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500" data-press-start @click="startStory">
        Press start
        <span class="ml-3 inline-block transition group-hover:translate-x-1">→</span>
      </button>
    </div>

    <div v-else-if="toyType === 'mind-quiz'" class="grid h-full gap-4">
      <div class="flex items-center justify-between gap-3 rounded-[1.5rem] bg-paper p-4">
        <span class="font-mono text-xs uppercase tracking-[0.18em] text-violet-700">score</span>
        <span class="text-4xl font-extrabold tracking-[-0.05em]">{{ quizScore }}/{{ quizQuestions.length }}</span>
      </div>
      <section v-for="(question, questionIndex) in quizQuestions" :key="question.scenario" class="rounded-[1.5rem] border border-ink/10 bg-paper/75 p-4">
        <h3 class="text-xl font-extrabold leading-tight tracking-[-0.03em]">{{ question.scenario }}</h3>
        <div class="mt-4 grid gap-2 md:grid-cols-2">
          <button v-for="(option, optionIndex) in question.options" :key="option.label" :class="answerButtonStyle({ state: getAnswerState(question, questionIndex, optionIndex) })" :aria-pressed="selectedQuizAnswers[questionIndex] === optionIndex" @click="selectQuizAnswer(questionIndex, optionIndex)">
            {{ option.label }}
          </button>
        </div>
        <p v-if="typeof selectedQuizAnswers[questionIndex] === 'number'" class="mt-3 font-hand text-2xl leading-6 text-violet-700">{{ question.options[selectedQuizAnswers[questionIndex]]?.reveal }}</p>
      </section>
      <p class="font-mono text-xs uppercase tracking-[0.16em] text-muted">{{ quizAnsweredCount === quizQuestions.length ? "quiz complete; invisible architecture hat awarded" : "choose like the branch depends on it" }}</p>
    </div>

    <div v-else-if="toyType === 'red-flags'" class="flex h-full flex-col justify-between gap-6">
      <div class="flex items-center justify-between gap-3">
        <span class="font-mono text-xs uppercase tracking-[0.18em] text-violet-700">cleared</span>
        <span class="text-4xl font-extrabold tracking-[-0.05em]">{{ clearedFlags.length }}/{{ flagItems.length }}</span>
      </div>
      <div class="flex flex-wrap content-center gap-3">
        <button v-for="flag in flagItems" :key="flag" :class="flagButtonStyle({ cleared: clearedFlags.includes(flag) })" :aria-pressed="clearedFlags.includes(flag)" @click="toggleFlag(flag)">
          {{ flag }}
        </button>
      </div>
      <p class="font-hand text-3xl leading-8 text-violet-700">{{ allFlagsCleared ? "Clean enough to stop whispering 'just one helper'." : "Hit the smells before they become architecture." }}</p>
    </div>

    <div v-else-if="toyType === 'repo-map'" data-repository-map class="relative h-[27rem] overflow-hidden rounded-[1.5rem] bg-paper">
      <svg class="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line v-for="connection in repositoryConnections" :key="`${connection.from}-${connection.to}`" :x1="findRepositoryNode(connection.from).x" :y1="findRepositoryNode(connection.from).y" :x2="findRepositoryNode(connection.to).x" :y2="findRepositoryNode(connection.to).y" stroke="#6D3BFF" stroke-width="0.35" stroke-linecap="round" opacity="0.55" />
      </svg>
      <button v-for="node in repositoryNodes" :key="node.key" class="absolute min-w-24 touch-none rounded-full border border-ink/10 bg-white px-4 py-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.08em] shadow-editorial transition focus:outline-none focus:ring-2 focus:ring-violet-500" :class="{ 'opacity-40': node.group === 'archive', 'bg-violet-500 text-paper': node.group === 'cvc', 'bg-ink text-paper': node.key === 'aida' }" :style="{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }" @focus="hoveredRepositoryKey = node.key" @mouseenter="hoveredRepositoryKey = node.key" @keydown="nudgeRepositoryNode($event, node.key)" @pointerdown="startRepositoryDrag($event, node.key)" @pointermove="moveRepositoryNode" @pointerup="stopRepositoryDrag" @pointercancel="stopRepositoryDrag">
        {{ node.label }}
      </button>
      <div class="absolute bottom-4 left-4 right-4 rounded-[1.25rem] bg-white/85 p-4 font-mono text-xs uppercase tracking-[0.14em] text-ink shadow-editorial">{{ currentRepositoryDescription }}</div>
    </div>

    <div v-else-if="toyType === 'aida-drop'" class="grid h-full gap-5 md:grid-cols-[0.8fr_1.2fr]">
      <div class="grid place-items-center rounded-[1.5rem] bg-paper">
        <button draggable="true" class="rounded-2xl bg-white p-6 text-left shadow-editorial transition hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-500" data-csv-file @dragstart="fileDropped = false" @click="dropCsvFile">
          <span class="block text-6xl">▦</span>
          <span class="mt-4 block font-mono text-xs uppercase tracking-[0.18em] text-violet-700">measurements.csv</span>
        </button>
      </div>
      <div class="relative grid place-items-center overflow-hidden rounded-[1.5rem] border border-dashed border-violet-500 bg-violet-50" data-drop-zone @dragover="allowCsvDrop" @drop="dropCsvFile" @click="dropCsvFile">
        <p v-if="!fileDropped" class="font-mono text-xs uppercase tracking-[0.18em] text-violet-700">drop here, or click because demos have mercy</p>
        <svg v-else viewBox="0 0 360 220" class="h-full w-full p-8" role="img" aria-label="Generated plot">
          <path d="M20 180 H335 M35 20 V190" stroke="#151417" stroke-width="4" opacity="0.25" />
          <path d="M35 160 C80 120 105 130 140 90 S210 35 245 75 S300 130 330 45" fill="none" stroke="#6D3BFF" stroke-width="10" stroke-linecap="round" />
          <circle cx="245" cy="75" r="9" fill="#151417" />
        </svg>
      </div>
    </div>

    <div v-else-if="toyType === 'pipeline'" class="grid h-full gap-5">
      <div class="flex flex-wrap gap-3">
        <button :class="branchButtonStyle({ active: activePipelineBranch === 'develop' })" @click="activePipelineBranch = 'develop'">develop prerelease</button>
        <button :class="branchButtonStyle({ active: activePipelineBranch === 'master' })" @click="activePipelineBranch = 'master'">master stable</button>
        <button class="rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500" data-git-push @click="runPipeline">{{ pipelineRunning ? "running" : "git push" }}</button>
      </div>
      <div class="grid gap-3 md:grid-cols-5">
        <div v-for="stage in pipelineStages" :key="stage" class="rounded-[1.25rem] border p-4 text-center font-mono text-[0.68rem] uppercase tracking-[0.12em] transition" :class="completedPipelineStages.includes(stage) ? 'border-violet-500 bg-violet-500 text-paper shadow-violet' : 'border-ink/10 bg-paper text-muted'">{{ stage }}</div>
      </div>
      <pre class="h-44 overflow-auto rounded-[1.5rem] bg-ink p-5 font-mono text-xs leading-6 text-paper"><code>{{ terminalLines.join("\n") }}{{ pipelineComplete ? "\n🎉 deploy reached oc deploy" : "" }}</code></pre>
    </div>

    <div v-else-if="toyType === 'cvc-split'" class="grid h-full content-center gap-5">
      <button :class="monolithBlockStyle({ broken: monolithBroken })" data-monolith-block @click="breakMonolith" @pointerdown="startMonolithHold" @pointerup="stopMonolithHold" @pointercancel="stopMonolithHold">
        {{ monolithBroken ? "@psvcommon/ui" : "@psvcommon/common-components" }}
      </button>
      <div class="grid gap-3 transition md:grid-cols-3" :class="monolithBroken ? 'opacity-100' : 'opacity-40'">
        <div v-for="packageName in ['editor family', 'plot family', 'form family']" :key="packageName" class="rounded-[1.25rem] bg-violet-50 p-4 text-center font-mono text-xs uppercase tracking-[0.14em] text-violet-700">{{ packageName }}</div>
      </div>
      <div class="mx-auto rotate-[-3deg] rounded-xl border-4 border-violet-500 px-4 py-3 text-center font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-violet-700">Idea — pitch it to Kevin</div>
    </div>

    <div v-else-if="toyType === 'valibridge'" class="grid h-full place-items-center gap-5 text-center">
      <div>
        <p class="text-[clamp(5rem,15vw,11rem)] font-extrabold leading-none tracking-[-0.05em] text-violet-500">tiny</p>
        <p class="mt-3 font-hand text-4xl text-violet-700">Because the team already speaks ValiBridge.</p>
      </div>
      <button class="rounded-full bg-ink px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500" data-skip-valibridge @click="goToNextScreen">Skip →</button>
    </div>

    <div v-else-if="toyType === 'outro'" class="grid h-full content-center gap-6 text-center">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6">
        <div class="rounded-full bg-violet-500 p-6 text-5xl font-extrabold text-paper shadow-violet">U</div>
        <div class="font-hand text-4xl text-violet-700">handoff</div>
        <div class="rounded-full bg-ink p-6 text-5xl font-extrabold text-paper shadow-editorial">S</div>
      </div>
      <div class="flex flex-wrap justify-center gap-3">
        <NuxtLink to="/docs/aida-architecture" class="rounded-full bg-violet-500 px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-paper transition hover:bg-violet-700">Enter explore mode →</NuxtLink>
        <NuxtLink to="/checklist" class="rounded-full border border-ink/10 px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-ink transition hover:border-violet-500 hover:text-violet-700">Checklist</NuxtLink>
        <button class="rounded-full border border-ink/10 px-6 py-4 font-mono text-xs uppercase tracking-[0.18em] text-ink transition hover:border-violet-500 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500" @click="replayStory">Replay</button>
      </div>
      <p class="font-hand text-4xl text-violet-700">Questions? WhatsApp group.</p>
    </div>
  </div>
</template>
