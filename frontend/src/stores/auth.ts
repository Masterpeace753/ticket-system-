import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { UserRef } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem('token'))
  const user = ref<UserRef | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.is_admin ?? false)

  async function login(username: string, password: string): Promise<void> {
    const data = await authApi.login(username, password)
    token.value = data.access_token
    sessionStorage.setItem('token', data.access_token)
    await fetchMe()
  }

  async function fetchMe(): Promise<void> {
    if (!token.value) return
    user.value = await authApi.me()
  }

  function logout(): void {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
  }

  return { token, user, isAuthenticated, isAdmin, login, fetchMe, logout }
})
