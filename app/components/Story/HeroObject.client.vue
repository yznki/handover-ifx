<script setup lang="ts">
import { computed, ref } from "vue";
import { TresCanvas } from "@tresjs/core";
import { Vector3 } from "three";
import { cva } from "class-variance-authority";

/**
 * A generated particle cube position.
 */
interface ParticlePosition {
  /**
   * Unique particle key.
   */
  key: string;

  /**
   * Mesh position.
   */
  position: Vector3;

  /**
   * Mesh scale.
   */
  scale: Vector3;
}

/**
 * Procedural hero object properties.
 */
interface HeroObjectProperties {
  /**
   * Whether the object is displayed as a small recurring story motif.
   */
  floating?: boolean;

  /**
   * Whether pointer movement repels the particle field.
   */
  interactive?: boolean;
}

const properties = withDefaults(defineProps<HeroObjectProperties>(), {
  floating: false,
  interactive: false
});

const shapeProgress = ref<number>(0);
const pointerPosition = ref<Vector3>(new Vector3(0, 0, 0));
const particleCount = 150;
const cameraPosition = new Vector3(0, 0, 4.35);
const lightPosition = new Vector3(2, 4, 6);
const rootStyle = cva("relative", {
  variants: {
    floating: {
      true: "h-screen w-screen overflow-visible rounded-none border-0 bg-transparent shadow-none",
      false: "h-[34rem] overflow-hidden rounded-[2.5rem] border border-ink/10 bg-gradient-to-br from-violet-50 via-paper to-white shadow-editorial"
    }
  }
});

const currentShapeIndex = computed<number>(() => Math.min(Math.floor(shapeProgress.value * 5), 4));
const groupPosition = computed<Vector3>(() => {
  const positions = [
    new Vector3(1.25, -0.08, 0),
    new Vector3(1.35, -0.65, 0),
    new Vector3(1.25, -0.7, 0),
    new Vector3(-1.05, -0.9, 0),
    new Vector3(0, -0.75, 0)
  ];
  return positions[currentShapeIndex.value] || positions[0] || new Vector3(0, 0, 0);
});
const groupScale = computed<Vector3>(() => {
  const scale = currentShapeIndex.value === 0 ? 1.08 : 0.82;
  return new Vector3(scale, scale, scale);
});
const groupRotation = computed<[number, number, number]>(() => [
  0.03 + pointerPosition.value.y * 0.05,
  currentShapeIndex.value === 0 ? pointerPosition.value.x * 0.06 : shapeProgress.value * 1.05 + pointerPosition.value.x * 0.08,
  currentShapeIndex.value === 0 ? 0 : 0.04
]);
const particles = computed<ParticlePosition[]>(() => Array.from({ length: particleCount }, (_unusedValue, particleIndex) => {
  const normalizedIndex = particleIndex / particleCount;
  const angle = normalizedIndex * Math.PI * 2;
  const wave = Math.sin(normalizedIndex * 20 + shapeProgress.value * 8);
  const letterY = createLetterYPosition(particleIndex);
  const chart = new Vector3((normalizedIndex - 0.5) * 4, Math.sin(normalizedIndex * Math.PI) * 2 - 0.8, wave * 0.5);
  const blocks = new Vector3((particleIndex % 7 - 3) * 0.55, (Math.floor(particleIndex / 7) % 6 - 3) * 0.45, Math.floor(particleIndex / 42) * 0.8 - 0.4);
  const bridge = new Vector3(Math.cos(angle) * 2.4, Math.sin(angle) * 0.6 - 0.7, Math.sin(angle) * 0.7);
  const handover = new Vector3((particleIndex % 2 === 0 ? -1.5 : 1.5) + Math.cos(angle) * 0.65, Math.sin(angle) * 0.9, wave * 0.55);
  const shapes = [letterY, chart, blocks, bridge, handover];
  const vector = shapes[currentShapeIndex.value] || letterY;
  const distance = vector.distanceTo(pointerPosition.value);
  const pointerForce = properties.interactive ? Math.max(0, 1.85 - distance) * 0.42 : 0;
  const pointerVector = vector.clone().sub(pointerPosition.value).normalize().multiplyScalar(pointerForce);
  const scale = currentShapeIndex.value === 0 ? 0.2 : 0.24 + Math.abs(wave) * 0.08;

  return {
    key: `particle-${particleIndex}`,
    position: vector.clone().add(pointerVector),
    scale: new Vector3(scale, scale, scale)
  };
}));

/**
 * Creates a crisp particle position along a letter Y.
 * @param particleIndex - Particle index.
 * @returns Letter Y particle position.
 */
function createLetterYPosition(particleIndex: number): Vector3 {
  const segmentSize = Math.floor(particleCount / 3);
  const segmentIndex = Math.floor(particleIndex / segmentSize);
  const positionInSegment = (particleIndex % segmentSize) / Math.max(1, segmentSize - 1);
  const thicknessOffset = ((particleIndex % 5) - 2) * 0.045;
  const depthOffset = ((particleIndex % 3) - 1) * 0.045;
  const leftBranch = new Vector3(-1.1 + positionInSegment * 1.1 + thicknessOffset, 1.35 - positionInSegment * 1.25, depthOffset);
  const rightBranch = new Vector3(1.1 - positionInSegment * 1.1 + thicknessOffset, 1.35 - positionInSegment * 1.25, depthOffset);
  const stem = new Vector3(thicknessOffset, 0.12 - positionInSegment * 1.75, depthOffset);
  const segments = [leftBranch, rightBranch, stem];
  return segments[Math.min(segmentIndex, segments.length - 1)] || stem;
}

/**
 * Updates the procedural shape by scroll progress.
 * @param progress - Scroll progress from zero to one.
 */
function setShapeProgress(progress: number): void {
  shapeProgress.value = progress;
}

/**
 * Updates pointer influence in normalized viewport space.
 * @param horizontalPosition - Horizontal pointer position from minus one to one.
 * @param verticalPosition - Vertical pointer position from minus one to one.
 */
function setPointerPosition(horizontalPosition: number, verticalPosition: number): void {
  pointerPosition.value = new Vector3(horizontalPosition * 2.2, verticalPosition * -1.6, 0);
}

defineExpose({ setShapeProgress, setPointerPosition });
</script>

<template>
  <div :class="rootStyle({ floating: properties.floating })">
    <TresCanvas :clear-color="properties.floating ? 'transparent' : '#F6F4EF'" :alpha="properties.floating" class="h-full w-full">
      <TresPerspectiveCamera :position="cameraPosition" :look-at="new Vector3(0, 0, 0)" />
      <TresAmbientLight :intensity="1.4" />
      <TresDirectionalLight :position="lightPosition" :intensity="1.8" />
      <TresGroup :position="groupPosition" :rotation="groupRotation" :scale="groupScale">
        <TresMesh v-for="particle in particles" :key="particle.key" :position="particle.position" :scale="particle.scale">
          <TresBoxGeometry :args="[1, 1, 1]" />
          <TresMeshStandardMaterial color="#6D3BFF" emissive="#3B1E8C" :emissive-intensity="0.18" :roughness="0.28" :metalness="0.12" />
        </TresMesh>
      </TresGroup>
    </TresCanvas>
    <div v-if="!properties.floating" class="pointer-events-none absolute inset-0 grid place-items-center opacity-25">
      <div class="text-[18rem] font-black leading-none tracking-[-0.16em] text-violet-500 blur-[1px]">Y</div>
    </div>
    <div v-if="!properties.floating" class="absolute bottom-5 left-5 rounded-full bg-paper/75 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-violet-700 backdrop-blur">Y → plot → blocks → bridge → handover</div>
  </div>
</template>
