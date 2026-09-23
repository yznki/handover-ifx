<script setup lang="ts">
import { navigateTo } from "#app";
import { useMediaQuery } from "@vueuse/core";
import { cva } from "class-variance-authority";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

/**
 * Single physics letter state.
 */
interface PhysicsLetter {
  /**
   * Stable letter identifier.
   */
  identifier: string;

  /**
   * Display character.
   */
  character: string;

  /**
   * Horizontal position in pixels.
   */
  horizontalPosition: number;

  /**
   * Vertical position in pixels.
   */
  verticalPosition: number;

  /**
   * Horizontal velocity in pixels per frame.
   */
  horizontalVelocity: number;

  /**
   * Vertical velocity in pixels per frame.
   */
  verticalVelocity: number;

  /**
   * Rotation in degrees.
   */
  rotation: number;

  /**
   * Rotation velocity in degrees per frame.
   */
  rotationVelocity: number;

  /**
   * Letter width in pixels.
   */
  width: number;

  /**
   * Letter height in pixels.
   */
  height: number;
}

/**
 * Active pointer drag state.
 */
interface DragState {
  /**
   * Letter identifier being dragged.
   */
  letterIdentifier: string;

  /**
   * Pointer identifier from the active pointer event.
   */
  pointerIdentifier: number;

  /**
   * Horizontal pointer offset from the letter origin.
   */
  horizontalOffset: number;

  /**
   * Vertical pointer offset from the letter origin.
   */
  verticalOffset: number;

  /**
   * Last horizontal pointer position.
   */
  lastHorizontalPosition: number;

  /**
   * Last vertical pointer position.
   */
  lastVerticalPosition: number;

  /**
   * Last pointer timestamp.
   */
  lastTimestamp: number;
}

const letterButtonStyle = cva("absolute select-none touch-none font-display text-[112px] font-black leading-[0.78] tracking-[-0.055em] outline-none transition-[filter] focus-visible:drop-shadow-[0_0_0.7rem_rgba(109,59,255,0.55)] md:text-[220px]", {
  variants: {
    punctuation: {
      true: "text-ink",
      false: "text-violet-600"
    }
  }
});
const enterButtonStyle = cva("rounded-full border-2 border-ink bg-paper px-7 py-4 font-mono text-xs font-bold uppercase tracking-[0.28em] shadow-[5px_5px_0_#151316] transition-transform duration-300 ease-out hover:bg-violet-600 hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-violet-500", {
  variants: {
    wiggling: {
      true: "animate-[wiggle_220ms_ease-in-out_1]",
      false: ""
    }
  }
});
const reducedMotionPreference = useMediaQuery("(prefers-reduced-motion: reduce)");

const stageElement = ref<HTMLElement | null>(null);
const letters = ref<PhysicsLetter[]>([]);
const dragState = ref<DragState | null>(null);
const dodgeCount = ref<number>(0);
const buttonWiggle = ref<boolean>(false);
const buttonOffset = ref<{ horizontal: number; vertical: number }>({ horizontal: 0, vertical: 0 });
const animationFrameIdentifier = ref<number>(0);
const lastFrameTimestamp = ref<number>(0);
const lastStageTapTimestamp = ref<number>(0);
const reducedMotion = computed<boolean>(() => reducedMotionPreference.value);
const buttonLabel = computed<string>(() => {
  const labels = ["Enter the handover →", "nope", "almost", "ok fine."];

  return labels[dodgeCount.value] || "ok fine.";
});

/**
 * Returns the letter size for the current viewport.
 */
function getLetterSize(): number {
  return window.innerWidth < 640 ? 112 : 220;
}

/**
 * Builds the initial letter layout.
 */
function createInitialLetters(dropFromTop: boolean): PhysicsLetter[] {
  const letterSize = getLetterSize();
  const totalWidth = letterSize * 2.55;
  const startHorizontalPosition = (window.innerWidth - totalWidth) / 2;
  const restingVerticalPosition = window.innerHeight * 0.38;
  const characters = ["b", "y", "e", "."];

  return characters.map((character, letterIndex) => ({
    identifier: `${character}-${letterIndex}`,
    character,
    horizontalPosition: startHorizontalPosition + letterIndex * letterSize * (character === "." ? 0.62 : 0.72),
    verticalPosition: dropFromTop ? -letterSize * (1.2 + letterIndex * 0.35) : restingVerticalPosition + (letterIndex % 2) * 8,
    horizontalVelocity: dropFromTop ? (letterIndex - 1.5) * 1.4 : 0,
    verticalVelocity: dropFromTop ? 2 + letterIndex * 0.8 : 0,
    rotation: dropFromTop ? -12 + letterIndex * 8 : -4 + letterIndex * 2,
    rotationVelocity: dropFromTop ? -1.2 + letterIndex * 0.7 : 0,
    width: character === "." ? letterSize * 0.36 : letterSize * 0.7,
    height: letterSize * 0.82
  }));
}

/**
 * Resets the physics toy to its opening state.
 */
function resetLetters(): void {
  letters.value = createInitialLetters(!reducedMotion.value);
}

/**
 * Resolves wall collision for one letter.
 * @param letter - Letter to constrain.
 */
function constrainLetterToStage(letter: PhysicsLetter): void {
  const floorPosition = Math.min(window.innerHeight - 148, window.innerHeight * 0.72);
  const rightWallPosition = window.innerWidth - 18;
  const leftWallPosition = 18;

  if (letter.horizontalPosition < leftWallPosition) {
    letter.horizontalPosition = leftWallPosition;
    letter.horizontalVelocity = Math.abs(letter.horizontalVelocity) * 0.58;
  }

  if (letter.horizontalPosition + letter.width > rightWallPosition) {
    letter.horizontalPosition = rightWallPosition - letter.width;
    letter.horizontalVelocity = -Math.abs(letter.horizontalVelocity) * 0.58;
  }

  if (letter.verticalPosition < 20) {
    letter.verticalPosition = 20;
    letter.verticalVelocity = Math.abs(letter.verticalVelocity) * 0.48;
  }

  if (letter.verticalPosition + letter.height > floorPosition) {
    letter.verticalPosition = floorPosition - letter.height;
    letter.verticalVelocity = -Math.abs(letter.verticalVelocity) * 0.42;
    letter.horizontalVelocity *= 0.86;
    letter.rotationVelocity *= 0.82;
  }
}

/**
 * Resolves collision between two letters using circular approximation.
 * @param firstLetter - First colliding letter.
 * @param secondLetter - Second colliding letter.
 */
function resolveLetterCollision(firstLetter: PhysicsLetter, secondLetter: PhysicsLetter): void {
  const firstCenterHorizontalPosition = firstLetter.horizontalPosition + firstLetter.width / 2;
  const firstCenterVerticalPosition = firstLetter.verticalPosition + firstLetter.height / 2;
  const secondCenterHorizontalPosition = secondLetter.horizontalPosition + secondLetter.width / 2;
  const secondCenterVerticalPosition = secondLetter.verticalPosition + secondLetter.height / 2;
  const horizontalDistance = secondCenterHorizontalPosition - firstCenterHorizontalPosition;
  const verticalDistance = secondCenterVerticalPosition - firstCenterVerticalPosition;
  const distance = Math.hypot(horizontalDistance, verticalDistance) || 1;
  const minimumDistance = (Math.min(firstLetter.width, firstLetter.height) + Math.min(secondLetter.width, secondLetter.height)) * 0.32;

  if (distance >= minimumDistance) return;

  const overlap = (minimumDistance - distance) / 2;
  const normalizedHorizontalDistance = horizontalDistance / distance;
  const normalizedVerticalDistance = verticalDistance / distance;
  firstLetter.horizontalPosition -= normalizedHorizontalDistance * overlap;
  firstLetter.verticalPosition -= normalizedVerticalDistance * overlap;
  secondLetter.horizontalPosition += normalizedHorizontalDistance * overlap;
  secondLetter.verticalPosition += normalizedVerticalDistance * overlap;

  const firstHorizontalVelocity = firstLetter.horizontalVelocity;
  const firstVerticalVelocity = firstLetter.verticalVelocity;
  firstLetter.horizontalVelocity = secondLetter.horizontalVelocity * 0.62;
  firstLetter.verticalVelocity = secondLetter.verticalVelocity * 0.62;
  secondLetter.horizontalVelocity = firstHorizontalVelocity * 0.62;
  secondLetter.verticalVelocity = firstVerticalVelocity * 0.62;
}

/**
 * Advances the physics simulation.
 * @param timestamp - Animation frame timestamp.
 */
function animateLetters(timestamp: number): void {
  const frameMultiplier = Math.min(2, (timestamp - (lastFrameTimestamp.value || timestamp)) / 16.67 || 1);
  lastFrameTimestamp.value = timestamp;

  if (!reducedMotion.value) {
    letters.value.forEach((letter) => {
      const isDragged = dragState.value?.letterIdentifier === letter.identifier;

      if (isDragged) return;

      letter.verticalVelocity += 0.55 * frameMultiplier;
      letter.horizontalPosition += letter.horizontalVelocity * frameMultiplier;
      letter.verticalPosition += letter.verticalVelocity * frameMultiplier;
      letter.rotation += letter.rotationVelocity * frameMultiplier;
      letter.horizontalVelocity *= 0.992;
      letter.rotationVelocity *= 0.985;
      constrainLetterToStage(letter);
    });

    letters.value.forEach((firstLetter, firstLetterIndex) => {
      letters.value.slice(firstLetterIndex + 1).forEach((secondLetter) => resolveLetterCollision(firstLetter, secondLetter));
    });
  }

  animationFrameIdentifier.value = window.requestAnimationFrame(animateLetters);
}

/**
 * Starts dragging a letter.
 * @param pointerEvent - Pointer event from the pressed letter.
 * @param letter - Pressed letter.
 */
function startLetterDrag(pointerEvent: PointerEvent, letter: PhysicsLetter): void {
  if (reducedMotion.value) return;

  const targetElement = pointerEvent.currentTarget instanceof HTMLElement ? pointerEvent.currentTarget : null;
  targetElement?.setPointerCapture(pointerEvent.pointerId);
  dragState.value = {
    letterIdentifier: letter.identifier,
    pointerIdentifier: pointerEvent.pointerId,
    horizontalOffset: pointerEvent.clientX - letter.horizontalPosition,
    verticalOffset: pointerEvent.clientY - letter.verticalPosition,
    lastHorizontalPosition: pointerEvent.clientX,
    lastVerticalPosition: pointerEvent.clientY,
    lastTimestamp: pointerEvent.timeStamp
  };
  letter.horizontalVelocity = 0;
  letter.verticalVelocity = 0;
  letter.rotationVelocity = 0;
}

/**
 * Moves the dragged letter.
 * @param pointerEvent - Pointer move event.
 */
function moveLetterDrag(pointerEvent: PointerEvent): void {
  const currentDragState = dragState.value;

  if (!currentDragState || currentDragState.pointerIdentifier !== pointerEvent.pointerId) return;

  const draggedLetter = letters.value.find((letter) => letter.identifier === currentDragState.letterIdentifier);

  if (!draggedLetter) return;

  const elapsedMilliseconds = Math.max(16, pointerEvent.timeStamp - currentDragState.lastTimestamp);
  draggedLetter.horizontalPosition = pointerEvent.clientX - currentDragState.horizontalOffset;
  draggedLetter.verticalPosition = pointerEvent.clientY - currentDragState.verticalOffset;
  draggedLetter.horizontalVelocity = ((pointerEvent.clientX - currentDragState.lastHorizontalPosition) / elapsedMilliseconds) * 16;
  draggedLetter.verticalVelocity = ((pointerEvent.clientY - currentDragState.lastVerticalPosition) / elapsedMilliseconds) * 16;
  draggedLetter.rotationVelocity = draggedLetter.horizontalVelocity * 0.08;
  currentDragState.lastHorizontalPosition = pointerEvent.clientX;
  currentDragState.lastVerticalPosition = pointerEvent.clientY;
  currentDragState.lastTimestamp = pointerEvent.timeStamp;
}

/**
 * Ends the active drag.
 * @param pointerEvent - Pointer release event.
 */
function endLetterDrag(pointerEvent: PointerEvent): void {
  if (dragState.value?.pointerIdentifier !== pointerEvent.pointerId) return;

  dragState.value = null;
}

/**
 * Resets letters when empty stage space is double-clicked.
 * @param mouseEvent - Double-click event.
 */
function resetWhenStageIsDoubleClicked(mouseEvent: MouseEvent): void {
  if (mouseEvent.target !== stageElement.value) return;

  resetLetters();
}

/**
 * Resets letters when empty stage space receives a double tap.
 * @param pointerEvent - Stage pointer event.
 */
function resetWhenStageIsDoubleTapped(pointerEvent: PointerEvent): void {
  if (pointerEvent.target !== stageElement.value || pointerEvent.pointerType === "mouse") return;

  const isDoubleTap = pointerEvent.timeStamp - lastStageTapTimestamp.value < 360;
  lastStageTapTimestamp.value = pointerEvent.timeStamp;

  if (!isDoubleTap) return;

  resetLetters();
}

/**
 * Makes the button dodge mouse approaches.
 */
function dodgeEnterButton(): void {
  if (reducedMotion.value || dodgeCount.value >= 3) return;

  const direction = dodgeCount.value % 2 === 0 ? 1 : -1;
  dodgeCount.value += 1;
  buttonOffset.value = {
    horizontal: direction * Math.min(120, window.innerWidth * 0.18),
    vertical: dodgeCount.value === 2 ? -26 : -10
  };
}

/**
 * Navigates to the docs entrypoint.
 */
function enterHandover(): void {
  navigateTo("/docs");
}

/**
 * Handles click activation for pointer users.
 * @param mouseEvent - Click event.
 */
function handleEnterButtonClick(mouseEvent: MouseEvent): void {
  if (reducedMotion.value || mouseEvent.detail === 0 || dodgeCount.value >= 3) {
    enterHandover();

    return;
  }

  mouseEvent.preventDefault();
  dodgeEnterButton();
}

/**
 * Handles touch activation with one tiny wiggle before navigation.
 * @param touchEvent - Touch event.
 */
function handleEnterButtonTouch(touchEvent: TouchEvent): void {
  if (reducedMotion.value) return;

  touchEvent.preventDefault();
  buttonWiggle.value = true;
  window.setTimeout(() => {
    buttonWiggle.value = false;
    enterHandover();
  }, 220);
}

/**
 * Handles viewport changes.
 */
function handleResize(): void {
  resetLetters();
}

onMounted(async () => {
  await nextTick();
  resetLetters();
  animationFrameIdentifier.value = window.requestAnimationFrame(animateLetters);
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrameIdentifier.value);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <main
    ref="stageElement"
    data-physics-bye
    class="relative isolate flex min-h-[100svh] select-none overflow-hidden bg-paper text-ink"
    @pointerdown="resetWhenStageIsDoubleTapped"
    @pointermove="moveLetterDrag"
    @pointerup="endLetterDrag"
    @pointercancel="endLetterDrag"
    @dblclick="resetWhenStageIsDoubleClicked"
  >
    <div class="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-55" />
    <div class="pointer-events-none absolute left-1/2 top-[17svh] z-10 w-[min(78vw,420px)] -translate-x-1/2 rotate-[-7deg] text-center font-hand text-4xl leading-none text-violet-600 md:left-[32vw] md:top-[22svh] md:w-auto md:text-5xl">
      go on, throw them.
      <svg class="mx-auto mt-1 h-14 w-40 text-violet-600" viewBox="0 0 170 58" fill="none" aria-hidden="true">
        <path d="M6 12C42 42 92 50 151 24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 8" />
        <path d="M139 10L154 24L133 31" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>

    <div class="absolute inset-0" aria-label="Interactive letters spelling bye. Double-click empty space to reset.">
      <button
        v-for="letter in letters"
        :key="letter.identifier"
        :class="letterButtonStyle({ punctuation: letter.character === '.' })"
        :style="{
          width: `${letter.width}px`,
          height: `${letter.height}px`,
          transform: `translate3d(${letter.horizontalPosition}px, ${letter.verticalPosition}px, 0) rotate(${letter.rotation}deg)`
        }"
        type="button"
        :aria-label="`Throw letter ${letter.character}`"
        @pointerdown="startLetterDrag($event, letter)"
      >
        {{ letter.character }}
      </button>
    </div>

    <div class="absolute inset-x-4 bottom-8 z-20 flex flex-col items-center gap-4 sm:bottom-10">
      <button
        data-enter-handover
        :class="enterButtonStyle({ wiggling: buttonWiggle })"
        :style="{ transform: `translate3d(${buttonOffset.horizontal}px, ${buttonOffset.vertical}px, 0)` }"
        type="button"
        @mouseenter="dodgeEnterButton"
        @click="handleEnterButtonClick"
        @touchstart="handleEnterButtonTouch"
      >
        {{ buttonLabel }}
      </button>
      <p class="text-center font-mono text-[11px] uppercase tracking-[0.28em] text-ink/45">
        Yazan · last day 28.09.2026
        <NuxtLink class="ml-3 underline decoration-ink/20 underline-offset-4 hover:text-violet-600" to="/docs">skip →</NuxtLink>
      </p>
    </div>
  </main>
</template>
