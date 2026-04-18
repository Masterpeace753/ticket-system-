<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch {
    error.value = t('login.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white rounded-lg shadow p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold text-primary mb-6 text-center">{{ t('app.title') }}</h1>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1" for="username">{{ t('login.username') }}</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            autocomplete="username"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1" for="password">{{ t('login.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <p v-if="error" role="alert" class="text-red-600 text-sm">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 rounded disabled:opacity-50"
        >
          {{ loading ? t('common.loading') : t('login.submit') }}
        </button>
      </form>
    </div>
  </div>
</template>
