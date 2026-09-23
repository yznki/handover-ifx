<script setup lang="ts">
/**
 * Documentation navigation entry.
 */
interface NavigationDocument {
  /**
   * Content path.
   */
  path: string;

  /**
   * Title shown in navigation.
   */
  title: string;

  /**
   * Optional ordering value.
   */
  order?: number;
}

const route = useRoute();
const path = computed<string>(() => `/docs/${(route.params.slug as string[]).join("/")}`);
const { data: page } = await useAsyncData(`document-${path.value}`, () => queryCollection("documents").path(path.value).first());
const { data: documents } = await useAsyncData("documentation-navigation", () => queryCollection("documents").where("path", "LIKE", "/docs/%").order("order", "ASC").all());
const navigationDocuments = computed<NavigationDocument[]>(() => (documents.value || []) as NavigationDocument[]);
</script>

<template>
  <main class="mx-auto grid max-w-[1700px] gap-8 px-4 pb-24 pt-28 md:grid-cols-[18rem_minmax(0,1fr)_16rem] md:px-8">
    <aside class="hidden md:block">
      <div class="sticky top-28 rounded-[2rem] border border-ink/10 bg-white/40 p-4 shadow-sm backdrop-blur">
        <p class="mb-4 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-violet-700">Explore mode</p>
        <NuxtLink v-for="document in navigationDocuments" :key="document.path" :to="document.path" class="block rounded-2xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-violet-50 hover:text-violet-700">
          {{ document.title }}
        </NuxtLink>
      </div>
    </aside>

    <article v-if="page" class="content-prose min-w-0 rounded-[2.5rem] border border-ink/10 bg-white/45 p-6 shadow-editorial backdrop-blur md:p-12">
      <ContentRenderer :value="page" />
    </article>
    <article v-else class="rounded-[2.5rem] border border-ink/10 bg-white/45 p-12">
      <h1 class="text-5xl font-black tracking-[-0.06em]">Page not found.</h1>
    </article>

    <aside class="hidden md:block">
      <div class="sticky top-28 rounded-[2rem] border border-violet-500/20 bg-violet-50 p-5">
        <p class="font-hand text-3xl leading-8 text-violet-700">Edit the long-form pages in content/docs. The animation should never be the place where facts hide.</p>
      </div>
    </aside>
  </main>
</template>
