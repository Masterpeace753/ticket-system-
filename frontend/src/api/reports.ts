import api from './axios'
import type { ReportRow } from '@/types'

export const reportsApi = {
  byStatus(): Promise<ReportRow[]> {
    return api.get('/reports/by-status').then((r) => r.data)
  },
  byAssignee(): Promise<ReportRow[]> {
    return api.get('/reports/by-assignee').then((r) => r.data)
  },
  byPriority(): Promise<ReportRow[]> {
    return api.get('/reports/by-priority').then((r) => r.data)
  },
  byCategory(): Promise<ReportRow[]> {
    return api.get('/reports/by-category').then((r) => r.data)
  },
}
