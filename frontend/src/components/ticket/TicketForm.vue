<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoriesStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'
import { usersApi } from '@/api/users'
import type { Ticket, TicketStatus, TicketPriority } from '@/types'

const { t } = useI18n()
const categories = useCategoriesStore()
const auth = useAuthStore()

const props = defineProps<{
  ticket?: Ticket | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: TicketFormData): void
  (e: 'cancel'): void
}>()

export interface TicketFormData {
  title: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  category_id: number | null
  ticket_type_id: number | null
  due_date: string
  assigned_to_id: number | null
}

const users = ref<{ id: number; display_name: string }[]>([])

const form = ref<TicketFormData>({
  title: props.ticket?.title ?? '',
  description: props.ticket?.description ?? '',
  priority: props.ticket?.priority ?? 'mittel',
  status: props.ticket?.status ?? 'neu',
  category_id: props.ticket?.category?.id ?? null,
  ticket_type_id: props.ticket?.ticket_type?.id ?? null,
  due_date: props.ticket?.due_date?.substring(0, 10) ?? '',
  assigned_to_id: props.ticket?.assigned_to?.id ?? null
})

const filteredTypes = computed(() =>
  categories.types.filter(tp => !form.value.category_id || tp.category_id === form.value.category_id)
)

const errors = ref<Partial<Record<keyof TicketFormData, string>>>({})

function validate(): boolean {
  errors.value = {}
  if (!form.value.title.trim()) errors.value.title = t('common.required')
  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return
  emit('submit', { ...form.value })
}

onMounted(async () => {
  await categories.fetchAll()
  const res = await usersApi.list()
  users.value = res.map(u => ({ id: u.id, display_name: u.display_name }))
})
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-8">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
      <h2 class="text-lg font-semibold mb-4">
        {{ ticket ? t('ticket.edit') : t('ticket.create') }}
      </h2>

      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.title') }} *</label>
          <input
            v-model="form.title"
            type="text"
            maxlength="200"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            :class="errors.title ? 'border-red-400' : 'border-gray-300'"
          />
          <p v-if="errors.title" class="text-red-500 text-xs mt-1">{{ errors.title }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.description') }}</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.priority') }}</label>
            <select v-model="form.priority" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option v-for="p in ['niedrig','mittel','hoch','kritisch']" :key="p" :value="p">{{ t(`priority.${p}`) }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.status') }}</label>
            <select v-model="form.status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option v-for="s in ['neu','zugewiesen','in_bearbeitung','wartet_auf_rueckmeldung','erledigt']" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.category') }}</label>
            <select v-model="form.category_id" @change="form.ticket_type_id = null" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option :value="null">—</option>
              <option v-for="c in categories.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.type') }}</label>
            <select v-model="form.ticket_type_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option :value="null">—</option>
              <option v-for="tp in filteredTypes" :key="tp.id" :value="tp.id">{{ tp.name }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.dueDate') }}</label>
            <input
              v-model="form.due_date"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('ticket.assignee') }}</label>
            <select v-model="form.assigned_to_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option :value="null">—</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.display_name }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="emit('cancel')" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
