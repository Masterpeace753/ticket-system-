import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ticketsApi, type TicketFilters } from '@/api/tickets'
import type { Ticket, TicketDetail } from '@/types'

export const useTicketsStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([])
  const loading = ref(false)
  const filters = ref<TicketFilters>({})

  async function fetchTickets(overrideFilters?: TicketFilters): Promise<void> {
    loading.value = true
    try {
      tickets.value = await ticketsApi.list(overrideFilters ?? filters.value)
    } finally {
      loading.value = false
    }
  }

  async function createTicket(data: Parameters<typeof ticketsApi.create>[0]): Promise<TicketDetail> {
    const ticket = await ticketsApi.create(data)
    await fetchTickets()
    return ticket
  }

  async function updateStatus(id: number, status: string): Promise<void> {
    await ticketsApi.updateStatus(id, status)
    await fetchTickets()
  }

  function setFilters(f: TicketFilters): void {
    filters.value = f
  }

  return { tickets, loading, filters, fetchTickets, createTicket, updateStatus, setFilters }
})
