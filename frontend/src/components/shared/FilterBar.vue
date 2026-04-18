<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoriesStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'
import type { TicketStatus, TicketPriority } from '@/types'

const { t } = useI18n()
const categories = useCategoriesStore()
const auth = useAuthStore()

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterValues): void
}>()

export interface FilterValues {
  search: string
  status: TicketStatus | ''
  priority: TicketPriority | ''
  category_id: number | ''
  assigned_to_me: boolean
  show_archived: boolean
}

const filters = ref<FilterValues>({
  search: '',
  status: '',
  priority: '',
  category_id: '',
  assigned_to_me: false,
  show_archived: false
})

function update() {
  emit('update:filters', { ...filters.value })
}

function reset() {
  filters.value = { search: '', status: '', priority: '', category_id: '', assigned_to_me: false, show_archived: false }
  update()
}

onMounted(() => categories.fetchAll())
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap gap-3 items-end">
    <div class="flex flex-col gap-1">
      <label class="text-xs text-gray-500">{{ t('filter.search') }}</label>
      <input
        v-model="filters.search"
        @input="update"
        type="text"
        :placeholder="t('filter.searchPlaceholder')"
        class="border border-gray-300 rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs text-gray-500">{{ t('filter.status') }}</label>
      <select v-model="filters.status" @change="update" class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">{{ t('filter.all') }}</option>
        <option v-for="s in ['neu','zugewiesen','in_bearbeitung','wartet_auf_rueckmeldung','erledigt']" :key="s" :value="s">
          {{ t(`status.${s}`) }}
        </option>
      </select>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs text-gray-500">{{ t('filter.priority') }}</label>
      <select v-model="filters.priority" @change="update" class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">{{ t('filter.all') }}</option>
        <option v-for="p in ['niedrig','mittel','hoch','kritisch']" :key="p" :value="p">
          {{ t(`priority.${p}`) }}
        </option>
      </select>
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-xs text-gray-500">{{ t('filter.category') }}</label>
      <select v-model="filters.category_id" @change="update" class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
        <option value="">{{ t('filter.all') }}</option>
        <option v-for="c in categories.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <div class="flex items-center gap-2">
      <input id="assigned_to_me" v-model="filters.assigned_to_me" @change="update" type="checkbox" class="accent-primary" />
      <label for="assigned_to_me" class="text-sm text-gray-700">{{ t('filter.assignedToMe') }}</label>
    </div>

    <div class="flex items-center gap-2">
      <input id="show_archived" v-model="filters.show_archived" @change="update" type="checkbox" class="accent-primary" />
      <label for="show_archived" class="text-sm text-gray-700">{{ t('filter.showArchived') }}</label>
    </div>

    <button @click="reset" class="text-sm text-gray-500 hover:text-primary underline ml-auto">
      {{ t('filter.reset') }}
    </button>
  </div>
</template>
