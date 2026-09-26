/**
 * Audience segment a PSV Labs app is built for.
 */
export type LabsAudience = "engineers" | "leads" | "software-team";

/**
 * Static pitch information for one PSV Labs prototype.
 */
export interface LabsCatalogEntry {
  /**
   * Position in the suite, used for ordering and the card number.
   */
  number: number;

  /**
   * Application identifier, equal to the repository and route name.
   */
  identifier: string;

  /**
   * Display name.
   */
  name: string;

  /**
   * One-line vision statement.
   */
  tagline: string;

  /**
   * The pain the app removes, in one sentence.
   */
  problem: string;

  /**
   * Human-readable audience label.
   */
  audienceLabel: string;

  /**
   * Audience segments used by the filter.
   */
  audiences: LabsAudience[];

  /**
   * How the app relates to the existing PSV tools.
   */
  relation: string;

  /**
   * The sixty-second demo to try first.
   */
  demo: string;
}

export const labsRepositoryBaseUrl = "https://gitlab.intra.infineon.com/ifx/des/dos-vv-psp/sw/labs";

export const labsCatalog: LabsCatalogEntry[] = [
  {
    number: 1,
    identifier: "sweepsmith",
    name: "SweepSmith",
    tagline: "Plan a characterization campaign like a chess engine.",
    problem: "Chamber ramps and naive loop nesting waste days of lab time, and nobody can say how long a 100k-point campaign will take.",
    audienceLabel: "CV engineers · validation leads",
    audiences: ["engineers", "leads"],
    relation: "Feeds TDEX & ValiBridge",
    demo: "Open the PLL campaign and press Optimize: 1,206 hours of lab time becomes 461."
  },
  {
    number: 2,
    identifier: "benchpulse",
    name: "BenchPulse",
    tagline: "A living digital twin of the validation lab.",
    problem: "Bench availability lives in heads and Outlook, and calibration status is invisible when you plan a run.",
    audienceLabel: "CV engineers · lab coordinators",
    audiences: ["engineers", "leads"],
    relation: "Reimagines LOST · MCD",
    demo: "Book a setup in one sentence: the solver picks bench C1 and moves SMU-17 over from B4."
  },
  {
    number: 3,
    identifier: "threadline",
    name: "Threadline",
    tagline: "Every number pulls a thread back to the chip that produced it.",
    problem: "Data crosses TDEX, SMB, VBin, AIDA and PDF with no shared identity, so one plugin bug means nobody knows which reports are wrong.",
    audienceLabel: "CV engineers · auditors",
    audiences: ["engineers", "leads"],
    relation: "Reimagines pdf-builder reports",
    demo: "Declare the SMU plugin bug: 8 of 40 runs affected, re-measured in 2 h 15 min instead of 25 h."
  },
  {
    number: 4,
    identifier: "headroom",
    name: "Headroom",
    tagline: "Know how much margin the silicon really has, before a customer does.",
    problem: "Cpk and guard bands are hand-computed per requirement in Excel, and margin erosion between silicon steps goes unseen.",
    audienceLabel: "CV engineers · product engineers",
    audiences: ["engineers", "leads"],
    relation: "Complements Requirements Manager",
    demo: "Replay the A-to-C silicon steps on the weather map and watch margin erode, cell by cell."
  },
  {
    number: 5,
    identifier: "constellation",
    name: "Constellation",
    tagline: "Traceability you can see. Every gap glows.",
    problem: "Traceability lives in tables, and requirement version changes silently invalidate evidence.",
    audienceLabel: "Validation leads · requirement owners",
    audiences: ["leads", "engineers"],
    relation: "Reimagines ValiBridge traceability",
    demo: "The traceability table says 94 % covered. The sky says 57 %, and shows you the dark stars."
  },
  {
    number: 6,
    identifier: "oddity",
    name: "Oddity",
    tagline: "Before you plot, know what is weird and whether to blame chip, bench or instrument.",
    problem: "Sentinel codes, drifting instruments and bench bias get silently averaged into plots.",
    audienceLabel: "CV engineers",
    audiences: ["engineers"],
    relation: "Pre-flight for AIDA",
    demo: "Pick a seeded campaign: 15 of 15 injected anomalies found, each blamed on chip, bench or instrument."
  },
  {
    number: 7,
    identifier: "tracepoint",
    name: "Tracepoint",
    tagline: "Scrub the whole bench on one synchronized timeline.",
    problem: "Debugging means juggling scope screenshots, supply logs and chamber logs on different clocks.",
    audienceLabel: "CV engineers debugging failures",
    audiences: ["engineers"],
    relation: "Fills AIDA's waveform gap",
    demo: "Open the PLL lock-loss session and press Find the break: it lands 126 ms before the error."
  },
  {
    number: 8,
    identifier: "benchbook",
    name: "Benchbook",
    tagline: "The lab notebook that writes itself while your hands are on the probes.",
    problem: "Bench observations vanish into paper and chat, and config drift between a good and a bad run costs days.",
    audienceLabel: "CV engineers at the bench",
    audiences: ["engineers"],
    relation: "Feeds ValiBridge executions",
    demo: "Ask what changed on run 15: probe-card rev D is named prime suspect, though nobody wrote it down."
  },
  {
    number: 9,
    identifier: "dejavu",
    name: "Déjà Vu",
    tagline: "Every failure has happened before. Déjà Vu remembers where and what fixed it.",
    problem: "Failure knowledge is scattered across Jira, Confluence and chat, so solved problems get debugged again.",
    audienceLabel: "Engineers · SW team · interns",
    audiences: ["engineers", "software-team"],
    relation: "Grows the Qdrant search experiment",
    demo: "Paste \"PLL jitter at cold\" and see where it happened before, why, and what fixed it."
  },
  {
    number: 10,
    identifier: "rosetta",
    name: "Rosetta",
    tagline: "One language for every measurement.",
    problem: "Temp_C, Temperature (C) and T_amb mean the same thing, and instrument error codes hide inside the data.",
    audienceLabel: "CV engineers · data stewards",
    audiences: ["engineers", "software-team"],
    relation: "Unblocks AIDA ingestion",
    demo: "Paste a raw TDEX header: every column resolved to a canonical quantity, unit and sentinel."
  },
  {
    number: 11,
    identifier: "phaseshift",
    name: "PhaseShift",
    tagline: "Stop guessing validation end dates.",
    problem: "Phase plans are deterministic Gantt charts that ignore throughput, silicon slips and shared benches.",
    audienceLabel: "Validation leads · managers",
    audiences: ["leads"],
    relation: "Complements ValiBridge phases",
    demo: "Drag the Tessera A-step eight weeks late and watch the ripple across shared benches."
  },
  {
    number: 12,
    identifier: "busfactor",
    name: "Busfactor",
    tagline: "Knowledge should not walk out the door.",
    problem: "Critical knowledge concentrates in single heads, and this handover is the proof.",
    audienceLabel: "SW team · team lead · interns",
    audiences: ["software-team", "leads"],
    relation: "Born from this handover",
    demo: "Simulate a departure: four modules orphaned on 30 October, and the pairing plan that saves them."
  },
  {
    number: 13,
    identifier: "driftwatch",
    name: "Driftwatch",
    tagline: "Know before you merge whether a release will break someone.",
    problem: "Prerelease drift, semantic-release traps and multi-stage deploys fail in cryptic, unconnected ways.",
    audienceLabel: "SW team · release owners",
    audiences: ["software-team"],
    relation: "Guards CVC & semantic-release",
    demo: "Simulate a release: the predicted version, twelve pre-flight checks and every consumer it breaks."
  },
  {
    number: 14,
    identifier: "promptproof",
    name: "PromptProof",
    tagline: "Contract tests for LLM features.",
    problem: "Prompt prose can describe tools the schema does not accept, and nothing measures whether the assistant still works.",
    audienceLabel: "SW team building AI features",
    audiences: ["software-team"],
    relation: "Defuses the prompt/schema landmine",
    demo: "Open the AIDA assistant contract: two prompt/schema drifts found and the merge is blocked."
  },
  {
    number: 15,
    identifier: "hyperjump",
    name: "Hyperjump",
    tagline: "Press Ctrl K and land anywhere in PSV.",
    problem: "Finding the action, dataset, ticket, MR and calibration record for one question takes six tabs and six searches.",
    audienceLabel: "Everyone",
    audiences: ["engineers", "leads", "software-team"],
    relation: "Reimagines Nucleus",
    demo: "Type \"overdue calibration on smus\" and land on the answer in milliseconds."
  }
];
