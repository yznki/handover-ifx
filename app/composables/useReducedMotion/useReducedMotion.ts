import { onMounted, ref } from "vue";
import type { Ref } from "vue";

/**
 * Reduced-motion preference state.
 */
export interface UseReducedMotionResponse {
  /**
   * Whether the operating system asks for reduced motion.
   */
  prefersReducedMotion: Ref<boolean>;
}

/**
 * Watches the system reduced-motion preference.
 * @returns Reactive reduced-motion preference.
 */
export function useReducedMotion(): UseReducedMotionResponse {
  const prefersReducedMotion = ref<boolean>(false);

  onMounted(() => {
    const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.value = mediaQueryList.matches;
    mediaQueryList.addEventListener("change", (event) => {
      prefersReducedMotion.value = event.matches;
    });
  });

  return { prefersReducedMotion };
}

