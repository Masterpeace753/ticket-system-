<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VueDraggableNext } from 'vue-draggable-next'
import TicketCard from './TicketCard.vue'
import type { Ticket, TicketStatus } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  status: TicketStatus
  tickets: Ticket[]
}>()

const emit = defineEmits<{
  (e: 'drop', ticketId: number, newStatus: TicketStatus): void
}>()

const statusColors: Record<string, string> = {
  neu: 'bg-gray-100 text-gray-700',
  zugewiesen: 'bg-blue-100 text-blue-700',
  in_bearbeitung: 'bg-yellow-100 text-yellow-700',
  wartet_auf_rueckmeldung: 'bg-purple-100 text-purple-700',
  erledigt: 'bg-green-100 text-green-700'
}

function onDragEnd(event: { item: HTMLElement }) {
  const ticketId = Number(event.item.dataset.id)
  if (!isNaN(ticketId)) emit('drop', ticketId, props.status)
}
</script>

<template>
  <div class="flex flex-col min-w-[220px] w-64 bg-gray-50 rounded-xl border border-gray-200">
    <div class="p-3 border-b border-gray-200 flex items-center justify-between">
      <span :class="['text-xs font-semibold px-2 py-1 rounded-full', statusColors[status]]">
        {{ t(`status.${status}`) }}
      </span>
      <span class="text-xs text-gray-400 ml-2">{{ tickets.length }}</span>
    </div>
    <VueDraggableNext
      :list="tickets"
      group="tickets"
      item-key="id"
      @end="onDragEnd"
      class="flex flex-col gap-2 p-3 min-h-[120px] flex-1"
    >
      <template #item="{ element }">
        <div :data-id="element.id">
          <TicketCard :ticket="element" />
        </div>
      </template>
    </VueDraggableNext>
  </div>
</template>
