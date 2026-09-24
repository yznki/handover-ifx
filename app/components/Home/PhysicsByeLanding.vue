<script setup lang="ts">
import { navigateTo } from "#app";
import { useMediaQuery } from "@vueuse/core";
import { cva } from "class-variance-authority";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useTheme } from "~/composables/useTheme/useTheme";

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

  /**
   * Horizontal squash scale.
   */
  horizontalScale: number;

  /**
   * Vertical squash scale.
   */
  verticalScale: number;

  /**
   * Whether the letter is black instead of purple.
   */
  black: boolean;

  /**
   * Whether this was typed by the visitor.
   */
  spawned: boolean;

  /**
   * Whether the letter is fading out.
   */
  fading: boolean;

  /**
   * Render opacity.
   */
  opacity: number;
}

/**
 * Small dust or confetti particle.
 */
interface PhysicsParticle {
  /**
   * Stable particle identifier.
   */
  identifier: string;

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
   * Particle size in pixels.
   */
  size: number;

  /**
   * Particle lifetime from zero to one.
   */
  life: number;

  /**
   * Whether the particle is black instead of purple.
   */
  black: boolean;
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

/**
 * DeviceMotionEvent constructor with optional permission API.
 */
interface PermissionedDeviceMotionEventConstructor {
  /**
   * Optional iOS permission request.
   */
  requestPermission?: () => Promise<"granted" | "denied">;
}

const maximumLetters = 60;
const initialNote = "go on, throw them.";
const soundStorageKey = "handover-sound-enabled";
const letterButtonStyle = cva("absolute select-none touch-none cursor-grab font-display text-[112px] font-black leading-[0.78] tracking-[-0.055em] outline-none transition-[filter] hover:drop-shadow-[0_0_0.7rem_rgba(109,59,255,0.18)] active:cursor-grabbing focus-visible:drop-shadow-[0_0_0.7rem_rgba(109,59,255,0.55)] md:text-[220px]", {
  variants: {
    black: {
      true: "text-ink",
      false: "text-violet-600"
    }
  }
});
const particleStyle = cva("absolute rounded-sm", {
  variants: {
    black: {
      true: "bg-ink",
      false: "bg-violet-600"
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
const coarsePointerPreference = useMediaQuery("(pointer: coarse)");
const { isDark, toggleTheme } = useTheme();

const stageElement = ref<HTMLElement | null>(null);
const letters = ref<PhysicsLetter[]>([]);
const particles = ref<PhysicsParticle[]>([]);
const dragState = ref<DragState | null>(null);
const dodgeCount = ref<number>(0);
const buttonWiggle = ref<boolean>(false);
const soundEnabled = ref<boolean>(false);
const noteText = ref<string>(initialNote);
const thrownCount = ref<number>(0);
const buttonOffset = ref<{ horizontal: number; vertical: number }>({ horizontal: 0, vertical: 0 });
const animationFrameIdentifier = ref<number>(0);
const idleTimeoutIdentifier = ref<number>(0);
const letterIdentifierCounter = ref<number>(0);
const particleIdentifierCounter = ref<number>(0);
const lastFrameTimestamp = ref<number>(0);
const lastStageTapTimestamp = ref<number>(0);
const architectureConfettiShown = ref<boolean>(false);
const audioContext = ref<AudioContext | null>(null);

const reducedMotion = computed<boolean>(() => reducedMotionPreference.value);
const allowTyping = computed<boolean>(() => !coarsePointerPreference.value);
const buttonLabel = computed<string>(() => {
  const labels = ["Enter the handover →", "nope", "almost", "ok fine."];

  return labels[dodgeCount.value] || "ok fine.";
});
const displayedNoteText = computed<string>(() => {
  if (noteText.value === "hey, I needed that.") return noteText.value;

  return thrownCount.value >= 3 && thrownCount.value < 10 ? "architect material." : noteText.value;
});

/**
 * Returns the letter size for the current viewport.
 */
function getLetterSize(): number {
  return window.innerWidth < 640 ? 112 : 220;
}

/**
 * Returns the resting floor position.
 */
function getFloorPosition(): number {
  return Math.min(window.innerHeight - 148, window.innerHeight * 0.72);
}

/**
 * Creates a single letter.
 * @param character - Character to display.
 * @param letterIndex - Position index.
 * @param spawned - Whether the visitor typed it.
 * @param dropFromTop - Whether it should enter from above.
 * @returns Physics letter.
 */
function createLetter(character: string, letterIndex: number, spawned: boolean, dropFromTop: boolean): PhysicsLetter {
  const letterSize = getLetterSize();
  const totalWidth = letterSize * 2.55;
  const startHorizontalPosition = (window.innerWidth - totalWidth) / 2;
  const typedHorizontalPosition = Math.max(24, Math.min(window.innerWidth - letterSize, window.innerWidth * (0.2 + Math.random() * 0.6)));
  const restingVerticalPosition = window.innerHeight * 0.38;
  const isPunctuation = character === "." || character === " " || character === "·";
  letterIdentifierCounter.value += 1;

  return {
    identifier: `${character}-${letterIdentifierCounter.value}`,
    character: character === " " ? "·" : character,
    horizontalPosition: spawned ? typedHorizontalPosition : startHorizontalPosition + letterIndex * letterSize * (character === "." ? 0.62 : 0.72),
    verticalPosition: dropFromTop ? -letterSize * (1.1 + Math.random() * 0.7) : restingVerticalPosition + (letterIndex % 2) * 8,
    horizontalVelocity: dropFromTop ? (Math.random() - 0.5) * 5 : 0,
    verticalVelocity: dropFromTop ? 2 + Math.random() * 3 : 0,
    rotation: dropFromTop ? -16 + Math.random() * 32 : -4 + letterIndex * 2,
    rotationVelocity: dropFromTop ? -1.5 + Math.random() * 3 : 0,
    width: isPunctuation ? letterSize * 0.36 : letterSize * 0.7,
    height: letterSize * 0.82,
    horizontalScale: 1,
    verticalScale: 1,
    black: spawned ? letterIndex % 2 === 1 : character === ".",
    spawned,
    fading: false,
    opacity: 1
  };
}

/**
 * Builds the initial letter layout.
 */
function createInitialLetters(dropFromTop: boolean): PhysicsLetter[] {
  return ["b", "y", "e", "."].map((character, letterIndex) => createLetter(character, letterIndex, false, dropFromTop));
}

/**
 * Clears transient state and resets the toy to bye.
 */
function resetLetters(): void {
  letters.value = createInitialLetters(!reducedMotion.value);
  particles.value = [];
  noteText.value = initialNote;
  thrownCount.value = 0;
  architectureConfettiShown.value = false;
  scheduleIdleHint();
}

/**
 * Schedules the typing hint after idle time.
 */
function scheduleIdleHint(): void {
  window.clearTimeout(idleTimeoutIdentifier.value);
  idleTimeoutIdentifier.value = window.setTimeout(() => {
    if (thrownCount.value > 0 || !allowTyping.value) return;

    noteText.value = "psst… you can also type.";
  }, 20_000);
}

/**
 * Plays a tiny impact sound when enabled.
 * @param velocity - Impact velocity.
 */
function playImpactSound(velocity: number): void {
  if (!soundEnabled.value || reducedMotion.value) return;

  const browserWindow = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
  const AudioContextConstructor = window.AudioContext || browserWindow.webkitAudioContext;

  if (!AudioContextConstructor) return;

  const resolvedAudioContext = audioContext.value || new AudioContextConstructor();
  audioContext.value = resolvedAudioContext;

  if (resolvedAudioContext.state === "suspended") return;

  const oscillator = resolvedAudioContext.createOscillator();
  const gain = resolvedAudioContext.createGain();
  oscillator.frequency.value = 130 + Math.min(velocity, 32) * 9;
  oscillator.type = "triangle";
  gain.gain.value = 0.025;
  oscillator.connect(gain);
  gain.connect(resolvedAudioContext.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, resolvedAudioContext.currentTime + 0.08);
  oscillator.stop(resolvedAudioContext.currentTime + 0.09);
}

/**
 * Emits a small landing dust puff.
 * @param letter - Letter that impacted.
 * @param velocity - Impact velocity.
 */
function createDustPuff(letter: PhysicsLetter, velocity: number): void {
  if (reducedMotion.value || velocity < 10) return;

  const particleCount = Math.min(9, Math.round(velocity / 3));
  const nextParticles = Array.from({ length: particleCount }, (_, particleIndex) => {
    particleIdentifierCounter.value += 1;

    return {
      identifier: `dust-${particleIdentifierCounter.value}`,
      horizontalPosition: letter.horizontalPosition + letter.width * (0.15 + Math.random() * 0.7),
      verticalPosition: getFloorPosition() - 4,
      horizontalVelocity: (Math.random() - 0.5) * 4,
      verticalVelocity: -Math.random() * 3 - 0.4,
      size: 3 + Math.random() * 4,
      life: 1,
      black: particleIndex % 3 === 0
    };
  });
  particles.value = [...particles.value, ...nextParticles];
}

/**
 * Emits one small celebratory burst.
 */
function createArchitectureConfetti(): void {
  if (architectureConfettiShown.value) return;

  architectureConfettiShown.value = true;
  noteText.value = "architect material.";

  if (reducedMotion.value) return;

  const centerHorizontalPosition = window.innerWidth / 2;
  const centerVerticalPosition = window.innerHeight * 0.34;
  particles.value = [
    ...particles.value,
    ...Array.from({ length: 26 }, (_, particleIndex) => {
      particleIdentifierCounter.value += 1;
      const angle = (Math.PI * 2 * particleIndex) / 26;
      const speed = 2 + Math.random() * 4;

      return {
        identifier: `confetti-${particleIdentifierCounter.value}`,
        horizontalPosition: centerHorizontalPosition,
        verticalPosition: centerVerticalPosition,
        horizontalVelocity: Math.cos(angle) * speed,
        verticalVelocity: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 5,
        life: 1,
        black: particleIndex % 2 === 0
      };
    })
  ];
}

/**
 * Notes that the visitor threw something.
 */
function registerThrow(): void {
  thrownCount.value += 1;
  const shouldCelebrateStacking = thrownCount.value === 3 && !architectureConfettiShown.value;

  if (shouldCelebrateStacking) {
    createArchitectureConfetti();

    return;
  }

  noteText.value = thrownCount.value >= 10 ? "ok you can go now ↓" : "nice arm.";
}

/**
 * Drops a runaway letter back into the stage.
 * @param letter - Escaped letter.
 */
function returnEscapedLetter(letter: PhysicsLetter): void {
  noteText.value = "hey, I needed that.";
  letter.fading = true;
  window.setTimeout(() => {
    letter.horizontalPosition = Math.max(24, Math.min(window.innerWidth - letter.width - 24, window.innerWidth * (0.25 + Math.random() * 0.5)));
    letter.verticalPosition = -letter.height * 1.2;
    letter.horizontalVelocity = (Math.random() - 0.5) * 4;
    letter.verticalVelocity = 3;
    letter.rotationVelocity = (Math.random() - 0.5) * 3;
    letter.fading = false;
    letter.opacity = 1;
  }, 1_500);
}

/**
 * Resolves wall collision for one letter.
 * @param letter - Letter to constrain.
 */
function constrainLetterToStage(letter: PhysicsLetter): void {
  const floorPosition = getFloorPosition();
  const rightWallPosition = window.innerWidth - 18;
  const leftWallPosition = 18;
  const impactVelocity = Math.abs(letter.verticalVelocity);

  if (letter.horizontalPosition < -letter.width && Math.abs(letter.horizontalVelocity) > 18) {
    returnEscapedLetter(letter);

    return;
  }

  if (letter.horizontalPosition > window.innerWidth && Math.abs(letter.horizontalVelocity) > 18) {
    returnEscapedLetter(letter);

    return;
  }

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
    letter.horizontalScale = 1 + Math.min(0.22, impactVelocity * 0.012);
    letter.verticalScale = 1 - Math.min(0.18, impactVelocity * 0.01);
    createDustPuff(letter, impactVelocity);
    playImpactSound(impactVelocity);
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
 * Checks if at least three letters form a small tower.
 */
function detectLetterStack(): void {
  if (architectureConfettiShown.value || thrownCount.value < 2) return;

  const stackCandidateLetters = letters.value.filter((letter) => Math.abs(letter.horizontalPosition + letter.width / 2 - window.innerWidth / 2) < 320);
  const verticalPositions = stackCandidateLetters.map((letter) => letter.verticalPosition);
  const verticalSpread = Math.max(...verticalPositions) - Math.min(...verticalPositions);
  const stackedLetterCount = stackCandidateLetters.length;

  if (stackedLetterCount < 3 || verticalSpread < 80) return;

  createArchitectureConfetti();
}

/**
 * Advances particles.
 * @param frameMultiplier - Frame delta multiplier.
 */
function animateParticles(frameMultiplier: number): void {
  particles.value.forEach((particle) => {
    particle.horizontalPosition += particle.horizontalVelocity * frameMultiplier;
    particle.verticalPosition += particle.verticalVelocity * frameMultiplier;
    particle.verticalVelocity += 0.08 * frameMultiplier;
    particle.life -= 0.025 * frameMultiplier;
  });
  particles.value = particles.value.filter((particle) => particle.life > 0);
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

      if (letter.fading) {
        letter.opacity = Math.max(0, letter.opacity - 0.04 * frameMultiplier);
      }

      letter.horizontalScale += (1 - letter.horizontalScale) * 0.16 * frameMultiplier;
      letter.verticalScale += (1 - letter.verticalScale) * 0.16 * frameMultiplier;

      if (isDragged || letter.fading) return;

      letter.verticalVelocity += 0.55 * frameMultiplier;
      letter.horizontalPosition += letter.horizontalVelocity * frameMultiplier;
      letter.verticalPosition += letter.verticalVelocity * frameMultiplier;
      letter.rotation += letter.rotationVelocity * frameMultiplier;
      letter.horizontalVelocity *= 0.992;
      letter.rotationVelocity *= 0.985;
      constrainLetterToStage(letter);
    });
    letters.value = letters.value.filter((letter) => letter.opacity > 0);

    letters.value.forEach((firstLetter, firstLetterIndex) => {
      letters.value.slice(firstLetterIndex + 1).forEach((secondLetter) => resolveLetterCollision(firstLetter, secondLetter));
    });
    detectLetterStack();
    animateParticles(frameMultiplier);
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
  const currentDragState = dragState.value;

  if (!currentDragState || currentDragState.pointerIdentifier !== pointerEvent.pointerId) return;

  const releasedLetter = letters.value.find((letter) => letter.identifier === currentDragState.letterIdentifier);
  dragState.value = null;

  if (!releasedLetter) return;

  registerThrow();
}

/**
 * Adds a tiny wobble when a letter is hovered.
 * @param letter - Hovered letter.
 */
function wobbleLetter(letter: PhysicsLetter): void {
  if (reducedMotion.value) return;

  letter.rotationVelocity += (letter.rotation % 2 === 0 ? 1 : -1) * 1.2;
}

/**
 * Spawns a typed character.
 * @param character - Printable character.
 */
function spawnTypedLetter(character: string): void {
  const nextLetter = createLetter(character, letters.value.length, true, !reducedMotion.value);

  if (letters.value.length >= maximumLetters) {
    const oldestLetter = letters.value[0];
    if (oldestLetter) oldestLetter.fading = true;
  }

  letters.value = [...letters.value, nextLetter];
}

/**
 * Removes the last typed character.
 */
function removeLastSpawnedLetter(): void {
  const lastSpawnedIndex = [...letters.value].reverse().findIndex((letter) => letter.spawned);

  if (lastSpawnedIndex === -1) return;

  const removalIndex = letters.value.length - 1 - lastSpawnedIndex;
  letters.value = letters.value.filter((letter, letterIndex) => letterIndex !== removalIndex);
}

/**
 * Handles keyboard spawning and reset shortcuts.
 * @param keyboardEvent - Keyboard event.
 */
function handleKeydown(keyboardEvent: KeyboardEvent): void {
  const activeElement = document.activeElement;
  const isButtonFocused = activeElement instanceof HTMLButtonElement || activeElement instanceof HTMLAnchorElement;

  if (keyboardEvent.key === "Escape") {
    resetLetters();

    return;
  }

  if (isButtonFocused || keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.altKey || !allowTyping.value) return;

  if (keyboardEvent.key === "Backspace") {
    keyboardEvent.preventDefault();
    removeLastSpawnedLetter();

    return;
  }

  if (keyboardEvent.key === " ") {
    keyboardEvent.preventDefault();
    jumpLetters();

    return;
  }

  if (keyboardEvent.key.length !== 1) return;

  keyboardEvent.preventDefault();
  spawnTypedLetter(keyboardEvent.key);
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
 * Makes all letters jump upward.
 */
function jumpLetters(): void {
  if (reducedMotion.value) return;

  letters.value.forEach((letter, letterIndex) => {
    letter.verticalVelocity = -10 - Math.random() * 7;
    letter.horizontalVelocity += (letterIndex % 2 === 0 ? -1 : 1) * (1.5 + Math.random() * 2);
    letter.rotationVelocity += (Math.random() - 0.5) * 4;
  });
  noteText.value = "boing.";
}

/**
 * Handles device shake.
 * @param deviceMotionEvent - Device motion event.
 */
function handleDeviceMotion(deviceMotionEvent: DeviceMotionEvent): void {
  const acceleration = deviceMotionEvent.accelerationIncludingGravity;
  const shakeStrength = Math.abs(acceleration?.x || 0) + Math.abs(acceleration?.y || 0) + Math.abs(acceleration?.z || 0);

  if (shakeStrength < 32) return;

  jumpLetters();
}

/**
 * Requests motion permission when required.
 */
async function requestMotionPermission(): Promise<void> {
  if (typeof DeviceMotionEvent === "undefined") return;

  const motionConstructor = DeviceMotionEvent as unknown as PermissionedDeviceMotionEventConstructor;

  if (!motionConstructor.requestPermission) {
    window.addEventListener("devicemotion", handleDeviceMotion);

    return;
  }

  const permission = await motionConstructor.requestPermission().catch(() => "denied" as const);

  if (permission !== "granted") return;

  window.addEventListener("devicemotion", handleDeviceMotion);
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
 * Toggles optional impact sound.
 */
async function toggleSound(): Promise<void> {
  soundEnabled.value = !soundEnabled.value;
  localStorage.setItem(soundStorageKey, soundEnabled.value ? "true" : "false");

  if (!soundEnabled.value) return;

  const browserWindow = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };
  const AudioContextConstructor = window.AudioContext || browserWindow.webkitAudioContext;

  if (!AudioContextConstructor) return;

  const resolvedAudioContext = audioContext.value || new AudioContextConstructor();
  audioContext.value = resolvedAudioContext;
  await resolvedAudioContext.resume();
  playImpactSound(14);
}

/**
 * Toggles dark mode on the landing page.
 */
function handleToggleTheme(): void {
  toggleTheme();
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
  requestMotionPermission();
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
  soundEnabled.value = localStorage.getItem(soundStorageKey) === "true";
  resetLetters();
  animationFrameIdentifier.value = window.requestAnimationFrame(animateLetters);
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeydown);
  requestMotionPermission();
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrameIdentifier.value);
  window.clearTimeout(idleTimeoutIdentifier.value);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("devicemotion", handleDeviceMotion);
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

    <Transition name="note-fade" mode="out-in">
      <div :key="displayedNoteText" class="pointer-events-none absolute left-1/2 top-[17svh] z-10 w-[min(78vw,420px)] -translate-x-1/2 rotate-[-7deg] text-center font-hand text-4xl leading-none text-violet-600 md:left-[32vw] md:top-[22svh] md:w-auto md:text-5xl">
        {{ displayedNoteText }}
        <svg class="mx-auto mt-1 h-14 w-40 text-violet-600" viewBox="0 0 170 58" fill="none" aria-hidden="true">
          <path d="M6 12C42 42 92 50 151 24" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 8" />
          <path d="M139 10L154 24L133 31" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </Transition>

    <p v-if="thrownCount > 0" class="pointer-events-none absolute bottom-8 left-5 z-20 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-ink/35 sm:bottom-10">
      thrown: {{ thrownCount }}
    </p>

    <div class="absolute bottom-28 right-5 z-30 flex flex-col items-end gap-2 sm:bottom-10">
      <button class="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/35 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500" type="button" @click="toggleSound">
        sound: {{ soundEnabled ? "on" : "off" }}
      </button>
      <button class="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/35 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500" type="button" :aria-pressed="isDark" title="Toggle dark mode" @click="handleToggleTheme">
        dark: {{ isDark ? "on" : "off" }}
      </button>
    </div>

    <div class="pointer-events-none absolute inset-0">
      <span
        v-for="particle in particles"
        :key="particle.identifier"
        :class="particleStyle({ black: particle.black })"
        :style="{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          opacity: particle.life,
          transform: `translate3d(${particle.horizontalPosition}px, ${particle.verticalPosition}px, 0) rotate(${particle.life * 180}deg)`
        }"
      />
    </div>

    <div class="absolute inset-0" aria-label="Interactive letters spelling bye. Double-click empty space to reset.">
      <button
        v-for="letter in letters"
        :key="letter.identifier"
        :class="letterButtonStyle({ black: letter.black })"
        :style="{
          width: `${letter.width}px`,
          height: `${letter.height}px`,
          opacity: letter.opacity,
          transform: `translate3d(${letter.horizontalPosition}px, ${letter.verticalPosition}px, 0) rotate(${letter.rotation}deg) scale(${letter.horizontalScale}, ${letter.verticalScale})`
        }"
        :data-letter-character="letter.character"
        type="button"
        :aria-label="`Throw letter ${letter.character}`"
        @pointerenter="wobbleLetter(letter)"
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
      </p>
    </div>
  </main>
</template>

<style scoped>
.note-fade-enter-active,
.note-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.note-fade-enter-from,
.note-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(0.4rem) rotate(-7deg);
}
</style>
