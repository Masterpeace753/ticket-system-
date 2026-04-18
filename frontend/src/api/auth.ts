import api from './axios'
import type { UserRef } from '@/types'

export const authApi = {
  login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    return api.post('/auth/login', { username, password }).then((r) => r.data)
  },

  me(): Promise<UserRef> {
    return api.get('/auth/me').then((r) => r.data)
  },
}
