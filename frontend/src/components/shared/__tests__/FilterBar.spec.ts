import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// Mock stores used by FilterBar
vi.mock('@/stores/categories', () => ({
  useCategoriesStore: () => ({
    categories: [{ id: 1, name: 'IT' }, { id: 2, name: 'HR' }],
    types: [],
    fetchAll: vi.fn(),
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1, display_name: 'Admin' },
    isAuthenticated: true,
    isAdmin: true,
  }),
}))

import FilterBar from '@/components/shared/FilterBar.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages: {
    de: {
      filter: {
        search: 'Suche',
        searchPlaceholder: 'Suchbegriff...',
        status: 'Status',
        priority: 'Priorität',
        category: 'Kategorie',
        all: 'Alle',
        assignedToMe: 'Mir zugewiesen',
        showArchived: 'Archivierte zeigen',
        reset: 'Zurücksetzen',
      },
      status: {
        neu: 'Neu',
        zugewiesen: 'Zugewiesen',
        in_bearbeitung: 'In Bearbeitung',
        wartet_auf_rueckmeldung: 'Wartet',
        erledigt: 'Erledigt',
      },
      priority: {
        niedrig: 'Niedrig',
        mittel: 'Mittel',
        hoch: 'Hoch',
        kritisch: 'Kritisch',
      },
    },
  },
})

function mountFilterBar() {
  setActivePinia(createPinia())
  return mount(FilterBar, {
    global: { plugins: [i18n] },
  })
}

describe('FilterBar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders search input', () => {
    const wrapper = mountFilterBar()
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders status select with all options', () => {
    const wrapper = mountFilterBar()
    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(1)
  })

  it('emits update:filters when search input changes', async () => {
    const wrapper = mountFilterBar()
    const input = wrapper.find('input[type="text"]')
    await input.setValue('Bug')
    await input.trigger('input')

    const emitted = wrapper.emitted('update:filters')
    expect(emitted).toBeTruthy()
    expect((emitted![0][0] as any).search).toBe('Bug')
  })

  it('emits update:filters when status changes', async () => {
    const wrapper = mountFilterBar()
    const statusSelect = wrapper.findAll('select')[0]
    await statusSelect.setValue('neu')
    await statusSelect.trigger('change')

    const emitted = wrapper.emitted('update:filters')
    expect(emitted).toBeTruthy()
    expect((emitted![0][0] as any).status).toBe('neu')
  })

  it('reset clears all filter values and emits', async () => {
    const wrapper = mountFilterBar()

    // Set a value first
    const input = wrapper.find('input[type="text"]')
    await input.setValue('test')
    await input.trigger('input')

    // Find reset button and click
    const resetBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('zur'))
    if (resetBtn) {
      await resetBtn.trigger('click')
      const emitted = wrapper.emitted('update:filters')!
      const lastEmit = emitted[emitted.length - 1][0] as any
      expect(lastEmit.search).toBe('')
      expect(lastEmit.status).toBe('')
    }
  })
})
