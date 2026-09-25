import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statusDirectory = resolve(process.env.LABS_STATUS_DIRECTORY || join(repositoryRoot, "..", "psv-labs", ".labs-infra", "status"));
const outputFile = join(repositoryRoot, "app", "data", "labs-status.json");
const allowedPhases = new Set(["building", "deployed", "done", "blocked"]);
const allowedGates = new Set(["readme", "checks", "unit", "e2e", "fallback", "review", "live", "pushed"]);
const liveUrlPattern = /^https:\/\/[a-z0-9-]+\.icp\.infineon\.com$/;

/**
 * Reads one builder status file and keeps only the fields the public page may show.
 * @param fileName - Status file name inside the status directory.
 * @returns The sanitized status entry, or undefined when the file is unusable.
 */
function readStatusEntry(fileName) {
  const rawStatus = JSON.parse(readFileSync(join(statusDirectory, fileName), "utf8"));
  const identifier = String(rawStatus.app || "");
  if (!identifier || `${identifier}.json` !== fileName) return undefined;
  const url = String(rawStatus.url || "").replace(/\/+$/, "");

  return {
    identifier,
    phase: allowedPhases.has(rawStatus.phase) ? rawStatus.phase : "building",
    url: liveUrlPattern.test(url) ? url : "",
    gatesPassed: Array.isArray(rawStatus.gatesPassed) ? rawStatus.gatesPassed.filter((gate) => allowedGates.has(gate)) : [],
    knownGaps: Array.isArray(rawStatus.knownGaps) ? rawStatus.knownGaps.map((gap) => String(gap).slice(0, 240)).slice(0, 8) : [],
    updatedAt: String(rawStatus.updatedAt || "")
  };
}

/**
 * Collects every readable status file, skipping malformed ones instead of failing the site build.
 * @returns Sanitized status entries sorted by identifier.
 */
function collectStatusEntries() {
  if (!existsSync(statusDirectory)) return [];

  return readdirSync(statusDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .flatMap((fileName) => {
      try {
        const entry = readStatusEntry(fileName);
        return entry ? [entry] : [];
      } catch (error) {
        console.warn(`[labs:sync] skipped ${fileName}: ${error.message}`);
        return [];
      }
    })
    .sort((firstEntry, secondEntry) => firstEntry.identifier.localeCompare(secondEntry.identifier));
}

const statusEntries = collectStatusEntries();
writeFileSync(outputFile, `${JSON.stringify({ syncedAt: new Date().toISOString(), apps: statusEntries }, null, 2)}\n`);
console.log(`[labs:sync] wrote ${statusEntries.length} status entries to ${outputFile}`);
