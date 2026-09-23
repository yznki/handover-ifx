<script setup lang="ts">
import { computed, ref } from "vue";
import { TresCanvas } from "@tresjs/core";
import { Vector3 } from "three";

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

const shapeProgress = ref<number>(0);
const particleCount = 84;
const cameraPosition = new Vector3(0, 0, 5);
const lightPosition = new Vector3(2, 4, 6);

const particles = computed<ParticlePosition[]>(() => Array.from({ length: particleCount }, (_unusedValue, particleIndex) => {
  const normalizedIndex = particleIndex / particleCount;
  const angle = normalizedIndex * Math.PI * 2;
  const storyShape = Math.floor(shapeProgress.value * 5);
  const wave = Math.sin(normalizedIndex * 20 + shapeProgress.value * 8);
  const letterY = new Vector3((normalizedIndex - 0.5) * 3.2, Math.abs(normalizedIndex - 0.5) * 4 - 1.8, wave * 0.4);
  const chart = new Vector3((normalizedIndex - 0.5) * 4, Math.sin(normalizedIndex * Math.PI) * 2 - 0.8, wave * 0.5);
  const blocks = new Vector3((particleIndex % 7 - 3) * 0.55, (Math.floor(particleIndex / 7) % 6 - 3) * 0.45, Math.floor(particleIndex / 42) * 0.8 - 0.4);
  const bridge = new Vector3(Math.cos(angle) * 2.4, Math.sin(angle) * 0.6 - 0.7, Math.sin(angle) * 0.7);
  const handover = new Vector3((particleIndex % 2 === 0 ? -1.5 : 1.5) + Math.cos(angle) * 0.65, Math.sin(angle) * 0.9, wave * 0.55);
  const shapes = [letterY, chart, blocks, bridge, handover];
  const vector = shapes[Math.min(storyShape, shapes.length - 1)] || letterY;
  const scale = 0.22 + Math.abs(wave) * 0.08;

  return {
    key: `particle-${particleIndex}`,
    position: vector,
    scale: new Vector3(scale, scale, scale)
  };
}));

/**
 * Updates the procedural shape by scroll progress.
 * @param progress - Scroll progress from zero to one.
 */
function setShapeProgress(progress: number): void {
  shapeProgress.value = progress;
}

defineExpose({ setShapeProgress });
</script>

<template>
  <div class="relative h-[34rem] overflow-hidden rounded-[2.5rem] border border-ink/10 bg-gradient-to-br from-violet-50 via-paper to-white shadow-editorial">
    <TresCanvas clear-color="#F6F4EF" class="h-full w-full">
      <TresPerspectiveCamera :position="cameraPosition" :look-at="new Vector3(0, 0, 0)" />
      <TresAmbientLight :intensity="1.4" />
      <TresDirectionalLight :position="lightPosition" :intensity="1.8" />
      <TresGroup :rotation="[0.25, shapeProgress * 1.4, 0.05]">
        <TresMesh v-for="particle in particles" :key="particle.key" :position="particle.position" :scale="particle.scale">
          <TresBoxGeometry :args="[1, 1, 1]" />
          <TresMeshStandardMaterial color="#6D3BFF" :roughness="0.32" :metalness="0.18" />
        </TresMesh>
      </TresGroup>
    </TresCanvas>
    <div class="pointer-events-none absolute inset-0 grid place-items-center opacity-25">
      <div class="text-[18rem] font-black leading-none tracking-[-0.16em] text-violet-500 blur-[1px]">Y</div>
    </div>
    <div class="absolute bottom-5 left-5 rounded-full bg-paper/75 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-violet-700 backdrop-blur">Y → plot → blocks → bridge → handover</div>
  </div>
</template>
