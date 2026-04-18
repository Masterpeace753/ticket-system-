<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/layout/AppHeader.vue'
import UserManagement from './UserManagement.vue'
import CategoryManagement from './CategoryManagement.vue'
import TypeManagement from './TypeManagement.vue'

const { t } = useI18n()

type Tab = 'users' | 'categories' | 'types'
const activeTab = ref<Tab>('users')

const tabs: { key: Tab; label: string }[] = [
  { key: 'users', label: t('admin.tabs.users') },
  { key: 'categories', label: t('admin.tabs.categories') },
  { key: 'types', label: t('admin.tabs.types') }
]
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <AppHeader />

    <main class="flex-1 p-6">
      <h1 class="text-xl font-bold text-gray-900 mb-4">{{ t('nav.admin') }}</h1>

      <div class="flex gap-1 mb-6 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <UserManagement v-if="activeTab === 'users'" />
        <CategoryManagement v-else-if="activeTab === 'categories'" />
        <TypeManagement v-else-if="activeTab === 'types'" />
      </div>
    </main>
  </div>
</template>
