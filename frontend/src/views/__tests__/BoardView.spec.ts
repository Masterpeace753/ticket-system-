import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// Mock child components to keep tests focused on BoardView logic
vi.mock('@/components/layout/AppHeader.vue', () => ({ default: { template: '<div data-testid="app-header" />' } }))
vi.mock('@/components/board/KanbanColumn.vue', () => ({ default: { template: '<div data-testid="kanban-column" />', props: ['status', 'tickets'], emits: ['drop'] } }))
vi.mock('@/components/shared/FilterBar.vue', () => ({ default: { template: '<div data-testid="filter-bar" />', emits: ['update:filters'] } }))
vi.mock('@/components/shared/LoadingSpinner.vue', () => ({ default: { template: '<div data-testid="loading-spinner" />' } }))
vi.mock('@/components/ticket/TicketForm.vue', () => ({ default: { template: '<div data-testid="ticket-form" />', props: ['ticket'], emits: ['submit', 'cancel'] } }))

vi.mock('@/api/tickets', () => ({
  ticketsApi: {
    list: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { id: 1, display_name: 'Admin', is_admin: true },
    isAuthenticated: true,
    isAdmin: true,
    token: 'tok',
  }),
}))

import BoardView from '@/views/BoardView.vue'
import { useTicketsStore } from '@/stores/tickets'
import { ticketsApi } from '@/api/tickets'

const mockTickets = [
  { id: 1, title: 'T1', status: 'neu', priority: 'mittel', is_archived: false, due_date: null, created_at: '', updated_at: '', description: null, created_by: null, assigned_to: null, category: null, ticket_type: null },
  { id: 2, title: 'T2', status: 'in_bearbeitung', priority: 'hoch', is_archived: false, due_date: null, created_at: '', updated_at: '', description: null, created_by: null, assigned_to: null, category: null, ticket_type: null },
]

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages: {
    de: {
      nav: { board: 'Board' },
      ticket: { create: 'Neues Ticket' },
    },
  },
})

function mountBoard() {
  setActivePinia(createPinia())
  vi.mocked(ticketsApi.list).mockResolvedValue(mockTickets as any)
  return mount(BoardView, {
    global: {
      plugins: [i18n],
      stubs: { teleport: true },
    },
  })
}

describe('BoardView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders board heading', async () => {
    const wrapper = mountBoard()
    await flushPromises()
    expect(wrapper.text()).toContain('Board')
  })

  it('fetches tickets on mount', async () => {
    mountBoard()
    await flushPromises()
    expect(ticketsApi.list).toHaveBeenCalledOnce()
  })

  it('renders 5 KanbanColumn components (one per status)', async () => {
    const wrapper = mountBoard()
    await flushPromises()
    const columns = wrapper.findAll('[data-testid="kanban-column"]')
    expect(columns).toHaveLength(5)
  })

  it('distributes tickets into correct status buckets', async () => {
    const wrapper = mountBoard()
    await flushPromises()
    const store = useTicketsStore()
    const neuTickets = store.tickets.filter(t => t.status === 'neu')
    const inProgressTickets = store.tickets.filter(t => t.status === 'in_bearbeitung')
    expect(neuTickets).toHaveLength(1)
    expect(inProgressTickets).toHaveLength(1)
  })

  it('shows "Neues Ticket" button', async () => {
    const wrapper = mountBoard()
    await flushPromises()
    expect(wrapper.text()).toContain('Neues Ticket')
  })

  it('opens TicketForm when "Neues Ticket" is clicked', async () => {
    const wrapper = mountBoard()
    await flushPromises()
    expect(wrapper.find('[data-testid="ticket-form"]').exists()).toBe(false)

    const btn = wrapper.find('button')
    await btn.trigger('click')
    expect(wrapper.find('[data-testid="ticket-form"]').exists()).toBe(true)
  })

  it('shows LoadingSpinner while tickets are loading', async () => {
    // Don't resolve the promise yet
    let resolve!: (v: any) => void
    vi.mocked(ticketsApi.list).mockReturnValue(new Promise(r => (resolve = r)))

    const wrapper = mountBoard()
    // Loading should be true before promise resolves
    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(true)

    resolve(mockTickets)
    await flushPromises()
    expect(wrapper.find('[data-testid="loading-spinner"]').exists()).toBe(false)
  })
})
