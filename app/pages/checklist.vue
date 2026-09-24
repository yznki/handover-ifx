<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { cva } from "class-variance-authority";

/**
 * Handover checklist item.
 */
interface ChecklistItem {
  /**
   * Stable checklist identifier.
   */
  identifier: string;

  /**
   * Owner from the decisions file.
   */
  owner: string;

  /**
   * Group label.
   */
  group: string;

  /**
   * Task title.
   */
  title: string;

  /**
   * Supporting context.
   */
  description: string;
}

const checklistItems: ChecklistItem[] = [
  { identifier: "split-showcase", owner: "Yazan", group: "Before I leave", title: "Split showcase/aida-demo", description: "Create one standalone-fixes merge request and one feat/onboarding-tour merge request, then delete showcase." },
  { identifier: "promote-aida", owner: "Yazan", group: "Before I leave", title: "Promote AIDA develop", description: "Promote develop 1.6.0-develop.1 to master." },
  { identifier: "delete-dead-local", owner: "Yazan", group: "Before I leave", title: "Delete dead local branches and stashes", description: "Remove local-only throwaway branches and stale stashes after the site build." },
  { identifier: "assistant-workflow", owner: "Uqba", group: "AIDA", title: "Plan Workflow 04 Assistant", description: "Use aida-plan-workflow plus competitor research; the current POC is a directional draft." },
  { identifier: "release-cvc", owner: "Uqba + Sandro", group: "CVC", title: "Release CVC 0.3.0 stable", description: "Develop is 24 commits ahead of master; release stable before larger split discussions." },
  { identifier: "fix-cvc-claude", owner: "Uqba + Sandro", group: "CVC", title: "Fix CVC CLAUDE.md consumer list", description: "It wrongly lists AIDA as a CVC consumer." },
  { identifier: "pitch-cvc-split", owner: "Uqba + Sandro", group: "CVC", title: "Pitch the CVC split to Kevin", description: "The Turborepo split is Yazan's idea only; present logic before treating it as approved." },
  { identifier: "valibridge-3677", owner: "Uqba + Sandro", group: "ValiBridge", title: "Remember VALIBRIDGE-3677", description: "The API branch bugfix/VALIBRIDGE-3677 is pushed but not merged into develop." },
  { identifier: "epic-4026", owner: "Uqba + Sandro", group: "ValiBridge", title: "Merge VALIBRIDGE-4026 epic", description: "Project phases epic is not merged to develop in client or API." },
  { identifier: "rotate-jira-token", owner: "Kevin", group: "Access & credentials", title: "Rotate aida-planning Jira token", description: "Secret name aida-planning-jira-token in namespace aida must stop depending on Yazan's personal Jira PAT." },
  { identifier: "playground-expiry", owner: "Uqba (Kevin backup)", group: "Access & credentials", title: "Track playground namespace expiry", description: "play-yazi-kamikazi expires around 2026-12-22." },
  { identifier: "walkthroughs", owner: "Yazan", group: "After I leave", title: "Run Fri 25 walkthrough sessions", description: "AIDA with Uqba, then CVC and CI/CD with Sandro and Uqba while they do a release." }
];

const storageKey = "handover-checklist-state";
const checkedIdentifiers = ref<string[]>([]);

const checkboxStyle = cva("grid h-5 w-5 shrink-0 place-items-center rounded-md border text-xs transition", {
  variants: {
    checked: {
      true: "border-violet-500 bg-violet-500 text-paper",
      false: "border-ink/20 bg-surface text-transparent"
    }
  }
});
const rowStyle = cva("grid w-full gap-4 border-b border-ink/10 px-4 py-4 text-left transition hover:bg-surface/45 sm:grid-cols-[auto_minmax(0,1fr)_9.5rem] sm:items-start", {
  variants: {
    checked: {
      true: "bg-violet-50/45",
      false: ""
    }
  }
});
const completionPercentage = computed<number>(() => Math.round((checkedIdentifiers.value.length / checklistItems.length) * 100));
const groups = computed<string[]>(() => [...new Set(checklistItems.map((item) => item.group))]);

/**
 * Checks whether an item is done.
 * @param identifier - The item identifier.
 * @returns Whether the item is checked.
 */
function isChecked(identifier: string): boolean {
  return checkedIdentifiers.value.includes(identifier);
}

/**
 * Returns checklist items for a group.
 * @param group - Group label.
 * @returns Items in the group.
 */
function getItemsByGroup(group: string): ChecklistItem[] {
  return checklistItems.filter((item) => item.group === group);
}

/**
 * Toggles a checklist item and persists the result.
 * @param identifier - The item identifier.
 */
function toggleItem(identifier: string): void {
  checkedIdentifiers.value = isChecked(identifier) ? checkedIdentifiers.value.filter((savedIdentifier) => savedIdentifier !== identifier) : [...checkedIdentifiers.value, identifier];
  localStorage.setItem(storageKey, JSON.stringify(checkedIdentifiers.value));
}

onMounted(() => {
  const storedValue = localStorage.getItem(storageKey);
  checkedIdentifiers.value = storedValue ? JSON.parse(storedValue) as string[] : [];
});
</script>

<template>
  <main class="mx-auto max-w-[1120px] px-4 pb-20 pt-24 sm:px-6">
    <header class="mb-8 border-b border-ink/10 pb-8">
      <p class="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-violet-700">Local checklist</p>
      <h1 class="text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-ink">Handover checklist</h1>
      <p class="mt-4 max-w-[68ch] text-lg leading-8 text-muted">State stays in this browser. No server, no secrets, no pretending this is Jira.</p>
      <div class="mt-7 max-w-xl">
        <div class="mb-2 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink/45">
          <span>{{ checkedIdentifiers.length }} of {{ checklistItems.length }} done</span>
          <span>{{ completionPercentage }}%</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-ink/10">
          <div class="h-full rounded-full bg-violet-500 transition-[width] duration-300" :style="{ width: `${completionPercentage}%` }" />
        </div>
      </div>
    </header>

    <section v-for="group in groups" :key="group" class="mb-8 overflow-hidden rounded-3xl border border-ink/10 bg-surface/30">
      <div class="border-b border-ink/10 px-4 py-3">
        <h2 class="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink/50">{{ group }}</h2>
      </div>
      <button v-for="item in getItemsByGroup(group)" :key="item.identifier" :class="rowStyle({ checked: isChecked(item.identifier) })" type="button" @click="toggleItem(item.identifier)">
        <span :class="checkboxStyle({ checked: isChecked(item.identifier) })">✓</span>
        <span>
          <span class="block text-base font-semibold tracking-[-0.01em] text-ink">{{ item.title }}</span>
          <span class="mt-1 block text-sm leading-6 text-muted">{{ item.description }}</span>
        </span>
        <span class="pt-0.5 text-left font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted sm:text-right">{{ item.owner }}</span>
      </button>
    </section>
  </main>
</template>
