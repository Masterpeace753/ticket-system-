import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriesApi, typesApi } from '@/api/categories'
import type { Category, TicketType } from '@/types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const types = ref<TicketType[]>([])

  async function fetchAll(): Promise<void> {
    ;[categories.value, types.value] = await Promise.all([
      categoriesApi.list(),
      typesApi.list(),
    ])
  }

  return { categories, types, fetchAll }
})
