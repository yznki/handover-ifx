import { computed, onMounted, type ComputedRef, type Ref } from "vue";

type ThemeMode = "light" | "dark";

/**
 * Shared color-theme controls.
 */
interface ThemeControls {
  /**
   * Current resolved theme mode.
   */
  themeMode: Ref<ThemeMode>;

  /**
   * Whether dark mode is active.
   */
  isDark: ComputedRef<boolean>;

  /**
   * Sets an explicit theme and persists it.
   */
  setTheme: (themeMode: ThemeMode) => void;

  /**
   * Toggles between light and dark mode.
   */
  toggleTheme: () => void;
}

const storageKey = "handover-theme";

/**
 * Reads a persisted explicit theme preference.
 * @returns Stored theme mode or an empty string.
 */
function getStoredTheme(): ThemeMode | "" {
  if (!import.meta.client) return "";

  const storedTheme = localStorage.getItem(storageKey);

  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "";
}

/**
 * Applies the theme to the document root.
 * @param themeMode - Theme mode to apply.
 */
function applyTheme(themeMode: ThemeMode): void {
  if (!import.meta.client) return;

  document.documentElement.classList.toggle("dark", themeMode === "dark");
  document.documentElement.dataset.theme = themeMode;
}

/**
 * Provides the shared theme controls.
 * @returns Theme state and actions.
 */
export function useTheme(): ThemeControls {
  const themeMode = useState<ThemeMode>("handover-theme-mode", () => getStoredTheme() || "light");
  const isDark = computed<boolean>(() => themeMode.value === "dark");

  /**
   * Sets an explicit theme and persists it.
   * @param nextThemeMode - Theme mode to persist.
   */
  function setTheme(nextThemeMode: ThemeMode): void {
    themeMode.value = nextThemeMode;
    if (!import.meta.client) return;

    localStorage.setItem(storageKey, nextThemeMode);
    applyTheme(nextThemeMode);
  }

  /**
   * Toggles the current theme.
   */
  function toggleTheme(): void {
    setTheme(isDark.value ? "light" : "dark");
  }

  onMounted(() => {
    const initialTheme = getStoredTheme() || "light";
    themeMode.value = initialTheme;
    applyTheme(initialTheme);
  });

  return {
    themeMode,
    isDark,
    setTheme,
    toggleTheme
  };
}
