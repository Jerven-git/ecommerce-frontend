<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Stores</h1>
        <p class="text-sm text-gray-500 mt-1">Each store is owned by exactly one admin (strict 1:1).</p>
      </div>
      <NuxtLink
        to="/super-admin/admins/new"
        class="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
      >
        New admin + store
      </NuxtLink>
    </header>

    <div class="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 text-sm text-purple-800">
      Stores are provisioned automatically when a new admin is created. Use the
      <NuxtLink to="/super-admin/admins/new" class="underline font-medium">New admin + store</NuxtLink>
      flow rather than creating a store on its own.
    </div>

    <section class="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Domains</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3">Admins</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-8 text-center text-gray-400">Loading…</td>
          </tr>
          <tr v-else-if="stores.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-400">No stores yet.</td>
          </tr>
          <tr v-for="s in stores" :key="s.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900">{{ s.name }}</span>
                <span v-if="s.is_default" class="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-50 text-purple-700 uppercase">default</span>
              </div>
              <div class="text-xs text-gray-400 font-mono mt-0.5">{{ s.slug }}</div>
            </td>
            <td class="px-6 py-4">
              <div v-if="s.domain" class="flex items-center gap-2">
                <span class="text-xs font-mono" :class="s.domain_verified ? 'text-purple-700' : 'text-gray-400'">{{ s.domain }}</span>
                <span v-if="!s.domain_verified" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-50 text-amber-700 uppercase">unverified</span>
              </div>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>
            <td class="px-6 py-4">
              <span
                class="px-2 py-0.5 text-xs font-medium rounded"
                :class="s.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'"
              >
                {{ s.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-gray-500">{{ s.users_count }}</td>
            <td class="px-6 py-4 text-right">
              <NuxtLink :to="`/super-admin/stores/${s.id}`" class="text-purple-700 hover:underline text-sm">Edit</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
const api = useSuperAdminApi()

const stores = ref<Store[]>([])
const loading = ref(true)

const refresh = async () => {
  loading.value = true
  try {
    const result = await api.listStores()
    stores.value = result.data
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>
