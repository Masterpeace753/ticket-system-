<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { reportsApi } from '@/api/reports'
import AppHeader from '@/components/layout/AppHeader.vue'
import LoadingSpinner from '@/components/shared/LoadingSpinner.vue'

const { t } = useI18n()

const byStatus = ref<any[]>([])
const byPriority = ref<any[]>([])
const byAssignee = ref<any[]>([])
const byCategory = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [s, p, a, c] = await Promise.all([
      reportsApi.byStatus(),
      reportsApi.byPriority(),
      reportsApi.byAssignee(),
      reportsApi.byCategory()
    ])
    byStatus.value = s
    byPriority.value = p
    byAssignee.value = a
    byCategory.value = c
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <AppHeader />

    <main class="flex-1 p-6">
      <h1 class="text-xl font-bold text-gray-900 mb-6">{{ t('nav.reports') }}</h1>

      <LoadingSpinner v-if="loading" />

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- By Status -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-3">{{ t('report.byStatus') }}</h2>
          <table class="w-full text-sm">
            <thead><tr class="text-left text-gray-400 text-xs"><th>{{ t('ticket.status') }}</th><th class="text-right">{{ t('report.count') }}</th></tr></thead>
            <tbody>
              <tr v-for="row in byStatus" :key="row.status" class="border-t border-gray-100">
                <td class="py-1.5">{{ t(`status.${row.status}`) }}</td>
                <td class="text-right font-semibold">{{ row.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- By Priority -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-3">{{ t('report.byPriority') }}</h2>
          <table class="w-full text-sm">
            <thead><tr class="text-left text-gray-400 text-xs"><th>{{ t('ticket.priority') }}</th><th class="text-right">{{ t('report.count') }}</th></tr></thead>
            <tbody>
              <tr v-for="row in byPriority" :key="row.priority" class="border-t border-gray-100">
                <td class="py-1.5">{{ t(`priority.${row.priority}`) }}</td>
                <td class="text-right font-semibold">{{ row.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- By Assignee -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-3">{{ t('report.byAssignee') }}</h2>
          <table class="w-full text-sm">
            <thead><tr class="text-left text-gray-400 text-xs"><th>{{ t('ticket.assignee') }}</th><th class="text-right">{{ t('report.count') }}</th></tr></thead>
            <tbody>
              <tr v-for="row in byAssignee" :key="row.assignee" class="border-t border-gray-100">
                <td class="py-1.5">{{ row.assignee ?? t('filter.unassigned') }}</td>
                <td class="text-right font-semibold">{{ row.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- By Category -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-3">{{ t('report.byCategory') }}</h2>
          <table class="w-full text-sm">
            <thead><tr class="text-left text-gray-400 text-xs"><th>{{ t('ticket.category') }}</th><th class="text-right">{{ t('report.count') }}</th></tr></thead>
            <tbody>
              <tr v-for="row in byCategory" :key="row.category" class="border-t border-gray-100">
                <td class="py-1.5">{{ row.category ?? '—' }}</td>
                <td class="text-right font-semibold">{{ row.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>
