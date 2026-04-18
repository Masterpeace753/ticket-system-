<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ticketsApi } from '@/api/tickets'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/layout/AppHeader.vue'
import CommentSection from '@/components/ticket/CommentSection.vue'
import TicketForm from '@/components/ticket/TicketForm.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'
import type { TicketDetail, TicketStatus } from '@/types'
import type { TicketFormData } from '@/components/ticket/TicketForm.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const ticket = ref<TicketDetail | null>(null)
const loading = ref(true)
const showEdit = ref(false)
const showDelete = ref(false)

const priorityClasses: Record<string, string> = {
  niedrig: 'bg-green-100 text-green-800',
  mittel: 'bg-yellow-100 text-yellow-800',
  hoch: 'bg-orange-100 text-orange-800',
  kritisch: 'bg-red-100 text-red-800'
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString()
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString()
}

async function fetchTicket() {
  loading.value = true
  try {
    ticket.value = await ticketsApi.get(Number(route.params.id))
  } finally {
    loading.value = false
  }
}

async function onEdit(data: TicketFormData) {
  await ticketsApi.update(ticket.value!.id, {
    title: data.title,
    description: data.description || undefined,
    priority: data.priority,
    status: data.status,
    category_id: data.category_id ?? undefined,
    ticket_type_id: data.ticket_type_id ?? undefined,
    due_date: data.due_date || undefined,
    assigned_to_id: data.assigned_to_id ?? undefined
  })
  showEdit.value = false
  await fetchTicket()
}

async function onDelete() {
  await ticketsApi.delete(ticket.value!.id)
  router.push('/')
}

onMounted(fetchTicket)
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <AppHeader />

    <main class="flex-1 p-6">
      <LoadingSpinner v-if="loading" />

      <div v-else-if="ticket" class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Main content -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-start justify-between gap-4 mb-4">
              <div>
                <span class="text-sm text-gray-400">#{{ ticket.id }}</span>
                <h1 class="text-xl font-semibold text-gray-900 mt-1">{{ ticket.title }}</h1>
              </div>
              <div class="flex gap-2">
                <button @click="showEdit = true" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  {{ t('common.edit') }}
                </button>
                <button v-if="auth.isAdmin" @click="showDelete = true" class="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                  {{ t('common.delete') }}
                </button>
              </div>
            </div>

            <p v-if="ticket.description" class="text-gray-700 text-sm whitespace-pre-wrap mb-4">{{ ticket.description }}</p>
            <p v-else class="text-gray-400 text-sm mb-4">—</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <CommentSection :ticket-id="ticket.id" />
          </div>

          <!-- Audit trail -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-base font-semibold mb-3">{{ t('audit.title') }}</h3>
            <div v-if="ticket.audit_log.length === 0" class="text-sm text-gray-400">{{ t('audit.empty') }}</div>
            <div class="space-y-2">
              <div v-for="entry in ticket.audit_log" :key="entry.id" class="text-sm text-gray-600 border-b border-gray-100 pb-2">
                <span class="font-medium text-gray-800">{{ entry.changed_by_name }}</span>
                {{ t('audit.changed') }}
                <span class="font-mono bg-gray-100 px-1 rounded text-xs">{{ entry.field_name }}</span>:
                <span class="text-red-500 line-through">{{ entry.old_value ?? '—' }}</span>
                → <span class="text-green-600">{{ entry.new_value ?? '—' }}</span>
                <span class="text-gray-400 ml-2">{{ formatDateTime(entry.changed_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Details sidebar -->
        <div class="flex flex-col gap-4">
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{{ t('ticket.details') }}</h3>
            <dl class="flex flex-col gap-3 text-sm">
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.status') }}</dt>
                <dd class="font-medium">{{ t(`status.${ticket.status}`) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.priority') }}</dt>
                <dd>
                  <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', priorityClasses[ticket.priority]]">
                    {{ t(`priority.${ticket.priority}`) }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.assignee') }}</dt>
                <dd class="font-medium">{{ ticket.assigned_to?.display_name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.category') }}</dt>
                <dd>{{ ticket.category?.name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.type') }}</dt>
                <dd>{{ ticket.ticket_type?.name ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.dueDate') }}</dt>
                <dd>{{ formatDate(ticket.due_date) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.createdAt') }}</dt>
                <dd>{{ formatDateTime(ticket.created_at) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-400">{{ t('ticket.createdBy') }}</dt>
                <dd>{{ ticket.created_by?.display_name ?? '—' }}</dd>
              </div>
              <div v-if="ticket.is_archived">
                <dd class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{{ t('ticket.archived') }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>

    <TicketForm
      v-if="showEdit"
      :ticket="ticket"
      @submit="onEdit"
      @cancel="showEdit = false"
    />

    <ConfirmDialog
      v-if="showDelete"
      :title="t('ticket.deleteTitle')"
      :message="t('ticket.deleteConfirm')"
      :confirm-label="t('common.delete')"
      :danger="true"
      @confirm="onDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>
