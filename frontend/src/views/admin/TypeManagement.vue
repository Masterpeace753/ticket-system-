<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { typesApi, categoriesApi } from '@/api/categories'
import DataTable from '@/components/admin/DataTable.vue'
import type { TicketType, Category } from '@/types'

const { t } = useI18n()

const types = ref<TicketType[]>([])
const categories = ref<Category[]>([])
const showCreate = ref(false)
const editTarget = ref<TicketType | null>(null)
const form = ref({ name: '', category_id: 0 })

const columns = [
  { key: 'name' as const, label: t('admin.types.name') },
  { key: 'category_id' as const, label: t('admin.types.category') }
]

async function load() {
  ;[types.value, categories.value] = await Promise.all([typesApi.list(), categoriesApi.list()])
}

function categoryName(id: number) {
  return categories.value.find(c => c.id === id)?.name ?? '—'
}

async function save() {
  if (editTarget.value) {
    await typesApi.update(editTarget.value.id, form.value)
  } else {
    await typesApi.create(form.value)
  }
  closeModal()
  await load()
}

function openEdit(row: TicketType) {
  editTarget.value = row
  form.value = { name: row.name, category_id: row.category_id }
  showCreate.value = true
}

function closeModal() {
  showCreate.value = false
  editTarget.value = null
  form.value = { name: '', category_id: 0 }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold">{{ t('admin.types.title') }}</h2>
      <button @click="showCreate = true" class="bg-primary text-white px-3 py-1.5 text-sm rounded-lg hover:bg-primary/90">
        + {{ t('admin.types.create') }}
      </button>
    </div>

    <DataTable :columns="columns" :rows="types" row-key="id" @edit="openEdit">
      <template #cell-category_id="{ row }">{{ categoryName(row.category_id) }}</template>
    </DataTable>

    <div v-if="showCreate" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="font-semibold mb-4">{{ editTarget ? t('common.edit') : t('admin.types.create') }}</h3>
        <form @submit.prevent="save" class="flex flex-col gap-3">
          <input v-model="form.name" :placeholder="t('admin.types.name')" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <select v-model="form.category_id" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option :value="0" disabled>{{ t('admin.types.selectCategory') }}</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm border border-gray-300 rounded-lg">{{ t('common.cancel') }}</button>
            <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">{{ t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
