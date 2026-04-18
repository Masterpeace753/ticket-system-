import api from './axios'
import type { User } from '@/types'

export const usersApi = {
  list(): Promise<User[]> {
    return api.get('/users').then((r) => r.data)
  },

  create(data: { username: string; display_name: string; password: string; is_admin?: boolean; email?: string }): Promise<User> {
    return api.post('/users', data).then((r) => r.data)
  },

  update(id: number, data: { display_name?: string; email?: string; is_admin?: boolean }): Promise<User> {
    return api.put(`/users/${id}`, data).then((r) => r.data)
  },

  deactivate(id: number): Promise<User> {
    return api.patch(`/users/${id}/deactivate`).then((r) => r.data)
  },
}
