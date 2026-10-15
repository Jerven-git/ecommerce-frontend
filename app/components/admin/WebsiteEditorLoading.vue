<template>
  <div
    class="relative flex min-h-0 flex-1 overflow-hidden bg-admin-surface"
    role="status"
    aria-live="polite"
    aria-label="Preparing website editor"
    aria-busy="true"
  >
    <aside class="hidden w-80 shrink-0 flex-col border-r border-admin-border bg-admin-surface xl:flex" aria-hidden="true">
      <div class="border-b border-admin-border px-4 py-4">
        <div class="h-4 w-28 rounded bg-admin-soft" />
        <div class="mt-2 h-3 w-52 rounded bg-admin-soft" />
      </div>
      <div class="space-y-2 p-3">
        <div
          v-for="item in 7"
          :key="item"
          class="flex min-h-14 items-center gap-3 rounded-xl px-3"
          :class="item === 1 ? 'bg-admin-accent-soft' : ''"
        >
          <span class="h-8 w-8 shrink-0 rounded-lg bg-admin-soft" />
          <span class="h-3 rounded bg-admin-soft" :class="item % 3 === 0 ? 'w-24' : 'w-36'" />
        </div>
      </div>
    </aside>

    <section class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" aria-hidden="true">
      <div class="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-admin-border px-3 sm:px-4">
        <div class="flex items-center gap-2">
          <span class="h-8 w-8 rounded-lg bg-admin-soft" />
          <div>
            <div class="h-3 w-20 rounded bg-admin-soft" />
            <div class="mt-2 h-2.5 w-40 rounded bg-admin-soft" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="hidden h-11 w-36 rounded-xl bg-admin-soft sm:block" />
          <span class="h-11 w-28 rounded-xl bg-admin-soft" />
        </div>
      </div>

      <div class="preview-canvas flex min-h-0 flex-1 justify-center overflow-hidden bg-admin-soft p-3 sm:p-4">
        <div class="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-[var(--admin-shadow-quiet)] ring-1 ring-admin-border">
          <div class="absolute inset-x-0 top-0 h-14 border-b border-admin-border bg-white" />
          <div class="absolute inset-x-5 top-20 h-32 rounded-xl bg-admin-soft sm:inset-x-10 sm:h-44" />
          <div class="absolute inset-x-5 top-60 grid grid-cols-2 gap-3 sm:inset-x-10 sm:top-72 sm:grid-cols-3">
            <span v-for="item in 3" :key="item" class="h-20 rounded-xl bg-admin-soft" />
          </div>

          <div class="absolute inset-0 flex items-center justify-center bg-white/80 px-6">
            <div class="max-w-sm text-center">
              <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-admin-accent-soft text-admin-accent-strong">
                <Icon name="heroicons:paint-brush" class="h-5 w-5 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              </span>
              <p class="mt-4 text-sm font-semibold text-admin-text">Preparing your private preview</p>
              <p class="mt-1 text-xs leading-5 text-admin-muted">Loading your draft, editor controls, and storefront preview.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
