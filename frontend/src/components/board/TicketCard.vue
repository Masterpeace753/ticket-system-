<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Ticket } from '@/types'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{ ticket: Ticket }>()

const priorityClasses: Record<string, string> = {
  niedrig: 'bg-green-100 text-green-800',
  mittel: 'bg-yellow-100 text-yellow-800',
  hoch: 'bg-orange-100 text-orange-800',
  kritisch: 'bg-red-100 text-red-800'
}

const priorityClass = computed(() => priorityClasses[props.ticket.priority] ?? 'bg-gray-100 text-gray-700')

const isOverdue = computed(() => {
  if (!props.ticket.due_date) return false
  return new Date(props.ticket.due_date) < new Date()
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString()
}

function openDetail() {
  router.push(`/tickets/${props.ticket.id}`)
}
</script>

<template>
  <div
    @click="openDetail"
    class="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-primary hover:shadow-sm transition-all"
  >
    <div class="flex items-start justify-between gap-2 mb-2">
      <span class="text-xs text-gray-400">#{{ ticket.id }}</span>
      <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', priorityClass]">
        {{ t(`priority.${ticket.priority}`) }}
      </span>
    </div>
    <p class="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{{ ticket.title }}</p>
    <div class="flex items-center justify-between gap-1 text-xs text-gray-500">
      <span v-if="ticket.category" class="truncate">{{ ticket.category.name }}</span>
      <span v-if="ticket.due_date" :class="['ml-auto whitespace-nowrap', isOverdue ? 'text-red-600 font-semibold' : '']">
        {{ formatDate(ticket.due_date) }}
      </span>
    </div>
    <div v-if="ticket.assigned_to" class="mt-2 text-xs text-gray-400 truncate">
      {{ ticket.assigned_to.display_name }}
    </div>
  </div>
</template>
