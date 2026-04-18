import api from './axios'
import type { Category, TicketType } from '@/types'

export const categoriesApi = {
  list(): Promise<Category[]> {
    return api.get('/categories').then((r) => r.data)
  },
  create(data: { name: string; description?: string }): Promise<Category> {
    return api.post('/categories', data).then((r) => r.data)
  },
  update(id: number, data: { name?: string; description?: string }): Promise<Category> {
    return api.put(`/categories/${id}`, data).then((r) => r.data)
  },
}

export const typesApi = {
  list(): Promise<TicketType[]> {
    return api.get('/types').then((r) => r.data)
  },
  create(data: { name: string; category_id: number }): Promise<TicketType> {
    return api.post('/types', data).then((r) => r.data)
  },
  update(id: number, data: { name?: string; category_id?: number }): Promise<TicketType> {
    return api.put(`/types/${id}`, data).then((r) => r.data)
  },
}
