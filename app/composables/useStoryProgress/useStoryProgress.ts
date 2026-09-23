import { computed, onMounted, ref } from "vue";
import type { ComputedRef, Ref } from "vue";

/**
 * Story progress state persisted in local storage.
 */
export interface UseStoryProgressResponse {
  /**
   * The last chapter path seen by the reader.
   */
  lastChapterPath: Ref<string>;

  /**
   * Whether a saved chapter is available.
   */
  hasProgress: ComputedRef<boolean>;

  /**
   * Stores a chapter path as the latest reading position.
   */
  rememberChapter: (chapterPath: string) => void;
}

const storageKey = "handover-story-progress";

/**
 * Persists the latest story chapter for the continue button.
 * @returns Reactive story progress helpers.
 */
export function useStoryProgress(): UseStoryProgressResponse {
  const lastChapterPath = ref<string>("");

  const hasProgress = computed<boolean>(() => lastChapterPath.value.length > 0);

  /**
   * Stores a chapter path as the latest reading position.
   * @param chapterPath - The content path of the chapter.
   */
  function rememberChapter(chapterPath: string): void {
    lastChapterPath.value = chapterPath;
    localStorage.setItem(storageKey, chapterPath);
  }

  onMounted(() => {
    lastChapterPath.value = localStorage.getItem(storageKey) || "";
  });

  return { lastChapterPath, hasProgress, rememberChapter };
}

