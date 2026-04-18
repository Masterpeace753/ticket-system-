<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()

function toggleLang() {
  locale.value = locale.value === 'de' ? 'en' : 'de'
  localStorage.setItem('lang', locale.value)
}

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <div class="flex items-center gap-6">
      <span class="text-primary font-bold text-lg">{{ t('app.title') }}</span>
      <nav class="flex gap-4 text-sm">
        <RouterLink to="/" class="hover:text-primary font-medium">{{ t('nav.board') }}</RouterLink>
        <RouterLink to="/reports" class="hover:text-primary font-medium">{{ t('nav.reports') }}</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" class="hover:text-primary font-medium">{{ t('nav.admin') }}</RouterLink>
      </nav>
    </div>
    <div class="flex items-center gap-4 text-sm">
      <span class="text-gray-600">{{ auth.user?.display_name }}</span>
      <button @click="toggleLang" class="border border-gray-300 rounded px-2 py-1 hover:bg-gray-50">
        {{ locale === 'de' ? '🇩🇪 DE' : '🇬🇧 EN' }}
      </button>
      <button @click="logout" class="text-gray-500 hover:text-primary">{{ t('app.logout') }}</button>
    </div>
  </header>
</template>
