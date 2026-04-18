import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/axios', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return { default: mockApi }
})

import api from '@/api/axios'
import { ticketsApi } from '@/api/tickets'

const mockTicket = {
  id: 1,
  title: 'Test-Ticket',
  description: null,
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

describe('ticketsApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list calls GET /tickets without filters', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [mockTicket] })

    const result = await ticketsApi.list()

    expect(api.get).toHaveBeenCalledWith('/tickets', { params: {} })
    expect(result).toEqual([mockTicket])
  })

  it('list passes filters as params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    await ticketsApi.list({ status: 'neu', priority: 'hoch', search: 'bug' })

    expect(api.get).toHaveBeenCalledWith('/tickets', {
      params: { status: 'neu', priority: 'hoch', search: 'bug' },
    })
  })

  it('get calls GET /tickets/:id', async () => {
    const detail = { ...mockTicket, comments: [], audit_log: [] }
    vi.mocked(api.get).mockResolvedValue({ data: detail })

    const result = await ticketsApi.get(1)

    expect(api.get).toHaveBeenCalledWith('/tickets/1')
    expect(result).toEqual(detail)
  })

  it('create posts to /tickets', async () => {
    const detail = { ...mockTicket, comments: [], audit_log: [] }
    vi.mocked(api.post).mockResolvedValue({ data: detail })

    const result = await ticketsApi.create({ title: 'Test-Ticket', priority: 'mittel' })

    expect(api.post).toHaveBeenCalledWith('/tickets', { title: 'Test-Ticket', priority: 'mittel' })
    expect(result).toEqual(detail)
  })

  it('updateStatus patches /tickets/:id/status', async () => {
    const detail = { ...mockTicket, status: 'in_bearbeitung' as const, comments: [], audit_log: [] }
    vi.mocked(api.patch).mockResolvedValue({ data: detail })

    const result = await ticketsApi.updateStatus(1, 'in_bearbeitung')

    expect(api.patch).toHaveBeenCalledWith('/tickets/1/status', { status: 'in_bearbeitung' })
    expect(result.status).toBe('in_bearbeitung')
  })

  it('update puts to /tickets/:id', async () => {
    const detail = { ...mockTicket, title: 'Geändert', comments: [], audit_log: [] }
    vi.mocked(api.put).mockResolvedValue({ data: detail })

    const result = await ticketsApi.update(1, { title: 'Geändert' })

    expect(api.put).toHaveBeenCalledWith('/tickets/1', { title: 'Geändert' })
    expect(result.title).toBe('Geändert')
  })

  it('listArchived calls GET /tickets/archived', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    await ticketsApi.listArchived(0, 25)

    expect(api.get).toHaveBeenCalledWith('/tickets/archived', { params: { skip: 0, limit: 25 } })
  })
})
