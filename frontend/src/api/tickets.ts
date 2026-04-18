import api from './axios'
import type { Ticket, TicketDetail, Comment, TicketStatus, TicketPriority } from '@/types'

export interface TicketFilters {
  status?: TicketStatus | string
  priority?: TicketPriority | string
  assigned_to_id?: number
  category_id?: number
  ticket_type_id?: number
  search?: string
  assigned_to_me?: boolean
  show_archived?: boolean
  skip?: number
  limit?: number
}

export const ticketsApi = {
  list(filters: TicketFilters = {}): Promise<Ticket[]> {
    return api.get('/tickets', { params: filters }).then((r) => r.data)
  },

  listArchived(skip = 0, limit = 50): Promise<Ticket[]> {
    return api.get('/tickets/archived', { params: { skip, limit } }).then((r) => r.data)
  },

  get(id: number): Promise<TicketDetail> {
    return api.get(`/tickets/${id}`).then((r) => r.data)
  },

  create(data: {
    title: string
    description?: string
    priority?: TicketPriority | string
    status?: TicketStatus | string
    due_date?: string
    assigned_to_id?: number | null
    category_id?: number | null
    ticket_type_id?: number | null
  }): Promise<TicketDetail> {
    return api.post('/tickets', data).then((r) => r.data)
  },

  update(id: number, data: {
    title?: string
    description?: string
    priority?: TicketPriority | string
    status?: TicketStatus | string
    due_date?: string
    assigned_to_id?: number | null
    category_id?: number | null
    ticket_type_id?: number | null
  }): Promise<TicketDetail> {
    return api.put(`/tickets/${id}`, data).then((r) => r.data)
  },

  updateStatus(id: number, status: TicketStatus | string): Promise<TicketDetail> {
    return api.patch(`/tickets/${id}/status`, { status }).then((r) => r.data)
  },

  assign(id: number, assigned_to_id: number | null): Promise<TicketDetail> {
    return api.patch(`/tickets/${id}/assign`, { assigned_to_id }).then((r) => r.data)
  },

  delete(id: number): Promise<void> {
    return api.delete(`/tickets/${id}`).then(() => undefined)
  },

  getComments(ticketId: number): Promise<Comment[]> {
    return api.get(`/tickets/${ticketId}/comments`).then((r) => r.data)
  },

  addComment(ticketId: number, content: string): Promise<Comment> {
    return api.post(`/tickets/${ticketId}/comments`, { content }).then((r) => r.data)
  },
}
