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
   * Task title.
   */
  title: string;

  /**
   * Supporting context.
   */
  description: string;
}

const checklistItems: ChecklistItem[] = [
  { identifier: "split-showcase", owner: "Yazan", title: "Split showcase/aida-demo", description: "Create one standalone-fixes merge request and one feat/onboarding-tour merge request, then delete showcase." },
  { identifier: "promote-aida", owner: "Yazan", title: "Promote AIDA develop", description: "Promote develop 1.6.0-develop.1 to master." },
  { identifier: "release-cvc", owner: "Sandro", title: "Release CVC 0.3.0 stable", description: "Develop is 24 commits ahead of master; release stable before larger split discussions." },
  { identifier: "rotate-jira-token", owner: "Kevin", title: "Rotate aida-planning Jira token", description: "Secret name aida-planning-jira-token in namespace aida must stop depending on Yazan's personal Jira PAT." },
  { identifier: "valibridge-3677", owner: "Uqba", title: "Remember VALIBRIDGE-3677", description: "The API branch bugfix/VALIBRIDGE-3677 is pushed but not merged into develop." },
  { identifier: "epic-4026", owner: "Sandro", title: "Merge VALIBRIDGE-4026 epic", description: "Project phases epic is not merged to develop in client or API." },
  { identifier: "fix-cvc-claude", owner: "Sandro", title: "Fix CVC CLAUDE.md consumer list", description: "It wrongly lists AIDA as a CVC consumer." },
  { identifier: "delete-dead-local", owner: "Yazan", title: "Delete dead local branches and stashes", description: "Remove local-only throwaway branches and stale stashes after the site build." },
  { identifier: "assistant-workflow", owner: "Uqba", title: "Plan Workflow 04 Assistant", description: "Use aida-plan-workflow plus competitor research; the current POC is a directional draft." },
  { identifier: "pitch-cvc-split", owner: "Sandro + Uqba", title: "Pitch the CVC split to Kevin", description: "The Turborepo split is Yazan's idea only; present logic before treating it as approved." },
  { identifier: "playground-expiry", owner: "Uqba (Kevin backup)", title: "Track playground namespace expiry", description: "play-yazi-kamikazi expires around 2026-12-22." },
  { identifier: "walkthroughs", owner: "Yazan", title: "Run Fri 25 walkthrough sessions", description: "AIDA with Uqba, then CVC and CI/CD with Sandro and Uqba while they do a release." }
];

const storageKey = "handover-checklist-state";
const checkedIdentifiers = ref<string[]>([]);

const completionPercentage = computed<number>(() => Math.round((checkedIdentifiers.value.length / checklistItems.length) * 100));
const checkboxStyle = cva("grid h-6 w-6 place-items-center rounded-full border text-xs transition", {
  variants: {
    checked: {
      true: "border-violet-500 bg-violet-500 text-paper",
      false: "border-ink/20 bg-white text-transparent"
    }
  }
});

/**
 * Checks whether an item is done.
 * @param identifier - The item identifier.
 * @returns Whether the item is checked.
 */
function isChecked(identifier: string): boolean {
  return checkedIdentifiers.value.includes(identifier);
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
  <main class="mx-auto max-w-[1400px] px-4 pb-24 pt-32 md:px-8">
    <section class="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
      <div class="md:sticky md:top-28 md:self-start">
        <p class="font-mono text-xs uppercase tracking-[0.28em] text-violet-700">Interactive / local only</p>
        <h1 class="mt-4 text-[clamp(4rem,11vw,10rem)] font-black leading-[0.78] tracking-[-0.09em]">Handover checklist.</h1>
        <p class="mt-8 max-w-xl text-xl leading-8 text-muted">Checkbox state stays in this browser. No server, no secrets, no pretending this is a project-management system.</p>
        <div class="mt-10 rounded-[2rem] border border-ink/10 bg-white/45 p-6 shadow-editorial">
          <div class="font-mono text-7xl font-bold tracking-[-0.08em] text-violet-700">{{ completionPercentage }}%</div>
          <p class="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-muted">complete in this browser</p>
        </div>
      </div>

      <div class="grid gap-4">
        <button v-for="item in checklistItems" :key="item.identifier" class="grid gap-4 rounded-[2rem] border border-ink/10 bg-white/45 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-editorial md:grid-cols-[auto_1fr_auto]" @click="toggleItem(item.identifier)">
          <span :class="checkboxStyle({ checked: isChecked(item.identifier) })">✓</span>
          <span>
            <span class="block text-2xl font-bold tracking-[-0.04em] text-ink">{{ item.title }}</span>
            <span class="mt-2 block leading-7 text-muted">{{ item.description }}</span>
          </span>
          <span class="rounded-full bg-violet-50 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-violet-700">{{ item.owner }}</span>
        </button>
      </div>
    </section>
  </main>
</template>
