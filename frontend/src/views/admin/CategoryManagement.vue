<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { categoriesApi } from '@/api/categories'
import DataTable from '@/components/admin/DataTable.vue'
import type { Category } from '@/types'

const { t } = useI18n()

const categories = ref<Category[]>([])
const showCreate = ref(false)
const editTarget = ref<Category | null>(null)
const form = ref({ name: '', description: '' })

const columns = [
  { key: 'name' as const, label: t('admin.categories.name') },
  { key: 'description' as const, label: t('admin.categories.description') }
]

async function load() {
  categories.value = await categoriesApi.list()
}

async function save() {
  if (editTarget.value) {
    await categoriesApi.update(editTarget.value.id, form.value)
  } else {
    await categoriesApi.create(form.value)
  }
  closeModal()
  await load()
}

function openEdit(row: Category) {
  editTarget.value = row
  form.value = { name: row.name, description: row.description ?? '' }
  showCreate.value = true
}

function closeModal() {
  showCreate.value = false
  editTarget.value = null
  form.value = { name: '', description: '' }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold">{{ t('admin.categories.title') }}</h2>
      <button @click="showCreate = true" class="bg-primary text-white px-3 py-1.5 text-sm rounded-lg hover:bg-primary/90">
        + {{ t('admin.categories.create') }}
      </button>
    </div>

    <DataTable :columns="columns" :rows="categories" row-key="id" @edit="openEdit" />

    <div v-if="showCreate" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="font-semibold mb-4">{{ editTarget ? t('common.edit') : t('admin.categories.create') }}</h3>
        <form @submit.prevent="save" class="flex flex-col gap-3">
          <input v-model="form.name" :placeholder="t('admin.categories.name')" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input v-model="form.description" :placeholder="t('admin.categories.description')" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm border border-gray-300 rounded-lg">{{ t('common.cancel') }}</button>
            <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">{{ t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
