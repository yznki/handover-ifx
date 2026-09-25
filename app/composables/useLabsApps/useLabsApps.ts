import labsStatusDocument from "~/data/labs-status.json";
import { labsCatalog, labsRepositoryBaseUrl, type LabsCatalogEntry } from "~/data/labsCatalog";

/**
 * Build phase reported by a PSV Labs builder.
 */
export type LabsPhase = "building" | "deployed" | "done" | "blocked";

/**
 * Definition-of-done gate a builder can pass.
 */
export type LabsGate = "readme" | "checks" | "unit" | "e2e" | "fallback" | "review" | "live" | "pushed";

/**
 * Sanitized builder status written by `pnpm labs:sync`.
 */
export interface LabsStatusEntry {
  /**
   * Application identifier.
   */
  identifier: string;

  /**
   * Current build phase.
   */
  phase: LabsPhase;

  /**
   * Live URL, empty until the app is deployed.
   */
  url: string;

  /**
   * Gates the builder has passed so far.
   */
  gatesPassed: LabsGate[];

  /**
   * Honest list of known gaps reported by the builder.
   */
  knownGaps: string[];

  /**
   * ISO timestamp of the last builder update.
   */
  updatedAt: string;
}

/**
 * Shape of the generated status document.
 */
interface LabsStatusDocument {
  /**
   * ISO timestamp of the last sync.
   */
  syncedAt: string;

  /**
   * Status entries per app.
   */
  apps: LabsStatusEntry[];
}

/**
 * Catalog entry merged with its latest build status.
 */
export interface LabsApp extends LabsCatalogEntry {
  /**
   * Latest build status.
   */
  status: LabsStatusEntry;

  /**
   * Whether the app has a reachable live URL.
   */
  isLive: boolean;

  /**
   * GitLab repository URL.
   */
  repositoryUrl: string;
}

/**
 * Return value of the PSV Labs composable.
 */
interface LabsAppsState {
  /**
   * All fifteen apps in suite order.
   */
  labsApps: LabsApp[];

  /**
   * Number of apps with a live URL.
   */
  liveCount: number;

  /**
   * Total gates passed across the suite.
   */
  gatesPassedCount: number;

  /**
   * Total gates available across the suite.
   */
  gatesAvailableCount: number;

  /**
   * ISO timestamp of the last status sync.
   */
  syncedAt: string;
}

export const labsGateOrder: LabsGate[] = ["readme", "checks", "unit", "e2e", "fallback", "review", "live", "pushed"];

/**
 * Merges the static PSV Labs catalog with the generated builder status.
 * @returns The merged apps and suite-level progress numbers.
 */
export function useLabsApps(): LabsAppsState {
  const statusDocument = labsStatusDocument as LabsStatusDocument;
  const statusByIdentifier = new Map(statusDocument.apps.map((statusEntry) => [statusEntry.identifier, statusEntry]));
  const labsApps = labsCatalog.map((catalogEntry) => {
    const status: LabsStatusEntry = statusByIdentifier.get(catalogEntry.identifier) || { identifier: catalogEntry.identifier, phase: "building", url: "", gatesPassed: [], knownGaps: [], updatedAt: "" };
    const isLive = (status.phase === "deployed" || status.phase === "done") && Boolean(status.url);

    return { ...catalogEntry, status, isLive, repositoryUrl: `${labsRepositoryBaseUrl}/${catalogEntry.identifier}` };
  });
  const liveCount = labsApps.filter((labsApp) => labsApp.isLive).length;
  const gatesPassedCount = labsApps.reduce((total, labsApp) => total + labsApp.status.gatesPassed.length, 0);

  return { labsApps, liveCount, gatesPassedCount, gatesAvailableCount: labsApps.length * labsGateOrder.length, syncedAt: statusDocument.syncedAt };
}
