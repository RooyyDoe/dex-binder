<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Card = {
  id: number
  externalId: string | null
  name: string
  setName: string
  number: string
  rarity: string | null
  imageUrl: string | null
  imageSmallUrl: string | null
}

const cards = ref<Card[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const apiBase = import.meta.env.VITE_API_BASE ?? '/api'

onMounted(async () => {
  try {
    const response = await fetch(`${apiBase}/cards`)

    if (!response.ok) {
      throw new Error(`Failed to load cards (${response.status})`)
    }

    cards.value = (await response.json()) as Card[]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="mx-auto min-h-screen max-w-6xl px-4 py-8">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-slate-900">Pokémon Binder Starter</h1>
      <p class="mt-2 text-slate-600">Cards from NestJS + Prisma API</p>
    </header>

    <p v-if="loading" class="text-slate-600">Loading cards...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <section v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <article
        v-for="card in cards"
        :key="card.id"
        class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <img
          v-if="card.imageSmallUrl || card.imageUrl"
          :src="card.imageSmallUrl ?? card.imageUrl ?? ''"
          :alt="card.name"
          class="h-44 w-full object-cover"
        />
        <div v-else class="flex h-44 items-center justify-center bg-slate-100 text-sm text-slate-500">
          No image
        </div>

        <div class="p-3">
          <h2 class="line-clamp-2 text-sm font-semibold text-slate-900">{{ card.name }}</h2>
          <p class="mt-1 text-xs text-slate-600">{{ card.setName }} • #{{ card.number }}</p>
          <p v-if="card.rarity" class="mt-1 text-xs text-slate-500">{{ card.rarity }}</p>
        </div>
      </article>
    </section>
  </main>
</template>
