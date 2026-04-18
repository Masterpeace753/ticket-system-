import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCategoriesStore } from '@/stores/categories'

vi.mock('@/api/categories', () => ({
  categoriesApi: {
    list: vi.fn(),
  },
  typesApi: {
    list: vi.fn(),
  },
}))

import { categoriesApi, typesApi } from '@/api/categories'

const mockCategories = [
  { id: 1, name: 'IT', description: 'IT-Probleme' },
  { id: 2, name: 'HR', description: null },
]

const mockTypes = [
  { id: 1, name: 'Bug', category_id: 1 },
  { id: 2, name: 'Feature', category_id: 1 },
]

describe('useCategoriesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty arrays', () => {
    const store = useCategoriesStore()
    expect(store.categories).toEqual([])
    expect(store.types).toEqual([])
  })

  it('fetchAll loads categories and types in parallel', async () => {
    vi.mocked(categoriesApi.list).mockResolvedValue(mockCategories)
    vi.mocked(typesApi.list).mockResolvedValue(mockTypes)

    const store = useCategoriesStore()
    await store.fetchAll()

    expect(store.categories).toEqual(mockCategories)
    expect(store.types).toEqual(mockTypes)
    expect(categoriesApi.list).toHaveBeenCalledOnce()
    expect(typesApi.list).toHaveBeenCalledOnce()
  })

  it('fetchAll overwrites previous data', async () => {
    vi.mocked(categoriesApi.list).mockResolvedValueOnce(mockCategories)
    vi.mocked(typesApi.list).mockResolvedValueOnce(mockTypes)
    const store = useCategoriesStore()
    await store.fetchAll()

    vi.mocked(categoriesApi.list).mockResolvedValueOnce([{ id: 3, name: 'Legal', description: null }])
    vi.mocked(typesApi.list).mockResolvedValueOnce([])
    await store.fetchAll()

    expect(store.categories).toHaveLength(1)
    expect(store.categories[0].name).toBe('Legal')
    expect(store.types).toEqual([])
  })
})
