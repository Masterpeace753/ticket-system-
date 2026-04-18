import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTicketsStore } from '@/stores/tickets'

vi.mock('@/api/tickets', () => ({
  ticketsApi: {
    list: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

import { ticketsApi } from '@/api/tickets'

const mockTicket = {
  id: 1,
  title: 'Test-Ticket',
  description: 'Beschreibung',
  status: 'neu' as const,
  priority: 'mittel' as const,
  is_archived: false,
  due_date: null,
  created_at: '2026-04-19T00:00:00Z',
  updated_at: '2026-04-19T00:00:00Z',
  created_by: null,
  assigned_to: null,
  category: null,
  ticket_type: null,
}

describe('useTicketsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with empty tickets and loading false', () => {
    const store = useTicketsStore()
    expect(store.tickets).toEqual([])
    expect(store.loading).toBe(false)
  })

  it('fetchTickets loads tickets and clears loading state', async () => {
    vi.mocked(ticketsApi.list).mockResolvedValue([mockTicket])

    const store = useTicketsStore()
    await store.fetchTickets()

    expect(store.tickets).toEqual([mockTicket])
    expect(store.loading).toBe(false)
  })

  it('fetchTickets uses store filters by default', async () => {
    vi.mocked(ticketsApi.list).mockResolvedValue([])

    const store = useTicketsStore()
    store.setFilters({ status: 'neu' })
    await store.fetchTickets()

    expect(ticketsApi.list).toHaveBeenCalledWith({ status: 'neu' })
  })

  it('fetchTickets uses override filters when provided', async () => {
    vi.mocked(ticketsApi.list).mockResolvedValue([])

    const store = useTicketsStore()
    store.setFilters({ status: 'neu' })
    await store.fetchTickets({ status: 'erledigt' })

    expect(ticketsApi.list).toHaveBeenCalledWith({ status: 'erledigt' })
  })

  it('createTicket calls api and refreshes list', async () => {
    const detail = { ...mockTicket, comments: [], audit_log: [] }
    vi.mocked(ticketsApi.create).mockResolvedValue(detail)
    vi.mocked(ticketsApi.list).mockResolvedValue([mockTicket])

    const store = useTicketsStore()
    const result = await store.createTicket({ title: 'Test-Ticket' })

    expect(ticketsApi.create).toHaveBeenCalledWith({ title: 'Test-Ticket' })
    expect(ticketsApi.list).toHaveBeenCalled()
    expect(result).toEqual(detail)
  })

  it('updateStatus calls api and refreshes list', async () => {
    const updated = { ...mockTicket, status: 'in_bearbeitung' as const, comments: [], audit_log: [] }
    vi.mocked(ticketsApi.updateStatus).mockResolvedValue(updated)
    vi.mocked(ticketsApi.list).mockResolvedValue([{ ...mockTicket, status: 'in_bearbeitung' as const }])

    const store = useTicketsStore()
    store.tickets = [mockTicket]
    await store.updateStatus(1, 'in_bearbeitung')

    expect(ticketsApi.updateStatus).toHaveBeenCalledWith(1, 'in_bearbeitung')
    expect(store.tickets[0].status).toBe('in_bearbeitung')
  })

  it('setFilters updates filters', () => {
    const store = useTicketsStore()
    store.setFilters({ priority: 'hoch', search: 'bug' })
    expect(store.filters).toEqual({ priority: 'hoch', search: 'bug' })
  })

  it('loading is true during fetch', async () => {
    let resolveList!: (v: typeof mockTicket[]) => void
    vi.mocked(ticketsApi.list).mockReturnValue(new Promise((r) => (resolveList = r)))

    const store = useTicketsStore()
    const fetchPromise = store.fetchTickets()
    expect(store.loading).toBe(true)

    resolveList([])
    await fetchPromise
    expect(store.loading).toBe(false)
  })
})
