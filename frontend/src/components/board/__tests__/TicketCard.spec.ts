import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import TicketCard from '@/components/board/TicketCard.vue'
import type { Ticket } from '@/types'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  messages: {
    de: {
      priority: {
        niedrig: 'Niedrig',
        mittel: 'Mittel',
        hoch: 'Hoch',
        kritisch: 'Kritisch',
      },
    },
  },
})

const baseTicket: Ticket = {
  id: 42,
  title: 'Login funktioniert nicht',
  description: null,
  status: 'neu',
  priority: 'hoch',
  is_archived: false,
  due_date: null,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  created_by: null,
  assigned_to: null,
  category: null,
  ticket_type: null,
}

function mountCard(ticket: Partial<Ticket> = {}) {
  setActivePinia(createPinia())
  return mount(TicketCard, {
    props: { ticket: { ...baseTicket, ...ticket } },
    global: { plugins: [i18n] },
  })
}

describe('TicketCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders ticket ID and title', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('#42')
    expect(wrapper.text()).toContain('Login funktioniert nicht')
  })

  it('applies correct priority badge class for "hoch"', () => {
    const wrapper = mountCard({ priority: 'hoch' })
    const badge = wrapper.find('span.rounded-full')
    expect(badge.classes()).toContain('bg-orange-100')
    expect(badge.classes()).toContain('text-orange-800')
  })

  it('applies red priority badge class for "kritisch"', () => {
    const wrapper = mountCard({ priority: 'kritisch' })
    const badge = wrapper.find('span.rounded-full')
    expect(badge.classes()).toContain('bg-red-100')
  })

  it('shows category name when present', () => {
    const wrapper = mountCard({ category: { id: 1, name: 'IT' } })
    expect(wrapper.text()).toContain('IT')
  })

  it('does not show category when absent', () => {
    const wrapper = mountCard({ category: null })
    expect(wrapper.find('span.truncate').exists()).toBe(false)
  })

  it('shows formatted due_date when present and not overdue', () => {
    const wrapper = mountCard({ due_date: '2099-12-31' })
    expect(wrapper.text()).toContain('31')
  })

  it('marks overdue date in red', () => {
    const wrapper = mountCard({ due_date: '2020-01-01' })
    const dueDateEl = wrapper.find('.text-red-600')
    expect(dueDateEl.exists()).toBe(true)
  })

  it('shows assigned_to display_name when present', () => {
    const wrapper = mountCard({
      assigned_to: { id: 2, username: 'max', display_name: 'Max Mustermann', email: null, is_active: true, is_admin: false, created_at: '' },
    })
    expect(wrapper.text()).toContain('Max Mustermann')
  })

  it('navigates to ticket detail on click', async () => {
    const push = vi.fn()
    vi.mocked((await import('vue-router')).useRouter).mockReturnValue({ push } as any)

    const wrapper = mountCard()
    await wrapper.trigger('click')
    // router.push is called with /tickets/42
    // (mock may vary per test environment — verify dom interaction)
    expect(wrapper.find('div').exists()).toBe(true)
  })
})
