export type TicketStatus =
  | 'neu'
  | 'zugewiesen'
  | 'in_bearbeitung'
  | 'wartet_auf_rueckmeldung'
  | 'erledigt'

export type TicketPriority = 'niedrig' | 'mittel' | 'hoch' | 'kritisch'

export interface User {
  id: number
  username: string
  display_name: string
  email: string | null
  is_active: boolean
  is_admin: boolean
  created_at: string
}

/** Alias for backward compat */
export type UserRef = User

export interface Category {
  id: number
  name: string
  description?: string | null
}

export interface TicketType {
  id: number
  name: string
  category_id: number
}

/** Slim ref used inside ticket responses */
export interface CategoryRef {
  id: number
  name: string
}

export interface AuditLog {
  id: number
  field_name: string
  old_value: string | null
  new_value: string | null
  changed_at: string
  changed_by_name: string
}

export interface Ticket {
  id: number
  title: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority
  is_archived: boolean
  due_date: string | null
  created_at: string
  updated_at: string
  created_by: UserRef | null
  assigned_to: UserRef | null
  category: CategoryRef | null
  ticket_type: CategoryRef | null
}

export interface TicketDetail extends Ticket {
  audit_log: AuditLog[]
}

export interface Comment {
  id: number
  content: string
  created_at: string
  author_id: number
  author_display_name: string
}

export interface ReportRow {
  [key: string]: string | number | null
}
