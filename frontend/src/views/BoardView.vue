<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTicketsStore } from '@/stores/tickets'
import { ticketsApi } from '@/api/tickets'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import KanbanColumn from '@/components/board/KanbanColumn.vue'
import FilterBar from '@/components/shared/FilterBar.vue'
import TicketForm from '@/components/ticket/TicketForm.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import type { TicketStatus } from '@/types'
import type { FilterValues } from '@/components/shared/FilterBar.vue'
import type { TicketFormData } from '@/components/ticket/TicketForm.vue'

const { t } = useI18n()
const ticketsStore = useTicketsStore()
const auth = useAuthStore()

const STATUSES: TicketStatus[] = ['neu', 'zugewiesen', 'in_bearbeitung', 'wartet_auf_rueckmeldung', 'erledigt']

const showForm = ref(false)
const filters = ref<FilterValues>({
  search: '',
  status: '',
  priority: '',
  category_id: '',
  assigned_to_me: false,
  show_archived: false
})

const ticketsByStatus = computed(() => {
  const map: Record<TicketStatus, typeof ticketsStore.tickets> = {
    neu: [],
    zugewiesen: [],
    in_bearbeitung: [],
    wartet_auf_rueckmeldung: [],
    erledigt: []
  }
  for (const t of ticketsStore.tickets) {
    if (map[t.status]) map[t.status].push(t)
  }
  return map
})

async function onFiltersUpdate(f: FilterValues) {
  filters.value = f
  await ticketsStore.fetchTickets({
    search: f.search || undefined,
    status: f.status || undefined,
    priority: f.priority || undefined,
    category_id: f.category_id || undefined,
    assigned_to_me: f.assigned_to_me || undefined,
    show_archived: f.show_archived || undefined
  })
}

async function onDrop(ticketId: number, newStatus: TicketStatus) {
  const ticket = ticketsStore.tickets.find(t => t.id === ticketId)
  if (!ticket || ticket.status === newStatus) return
  try {
    await ticketsApi.updateStatus(ticketId, newStatus)
    await ticketsStore.fetchTickets()
  } catch {
    // silently ignore; status stays unchanged
  }
}

async function onCreateTicket(data: TicketFormData) {
  await ticketsApi.create({
    title: data.title,
    description: data.description || undefined,
    priority: data.priority,
    status: data.status,
    category_id: data.category_id ?? undefined,
    ticket_type_id: data.ticket_type_id ?? undefined,
    due_date: data.due_date || undefined,
    assigned_to_id: data.assigned_to_id ?? undefined
  })
  showForm.value = false
  await ticketsStore.fetchTickets()
}

onMounted(() => ticketsStore.fetchTickets())
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <AppHeader />

    <main class="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900">{{ t('nav.board') }}</h1>
        <button
          @click="showForm = true"
          class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          + {{ t('ticket.create') }}
        </button>
      </div>

      <FilterBar @update:filters="onFiltersUpdate" />

      <LoadingSpinner v-if="ticketsStore.loading" />

      <div v-else class="flex gap-4 overflow-x-auto pb-4 flex-1">
        <KanbanColumn
          v-for="status in STATUSES"
          :key="status"
          :status="status"
          :tickets="ticketsByStatus[status]"
          @drop="onDrop"
        />
      </div>
    </main>

    <TicketForm
      v-if="showForm"
      @submit="onCreateTicket"
      @cancel="showForm = false"
    />
  </div>
</template>
