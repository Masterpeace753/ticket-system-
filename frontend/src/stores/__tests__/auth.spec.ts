import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
  },
}))

import { authApi } from '@/api/auth'

const mockUser = {
  id: 1,
  username: 'admin',
  display_name: 'Admin User',
  email: 'admin@example.com',
  is_active: true,
  is_admin: true,
  created_at: '2026-04-19T00:00:00Z',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes unauthenticated when no token in sessionStorage', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
  })

  it('initializes authenticated when token exists in sessionStorage', () => {
    sessionStorage.setItem('token', 'test-token')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
    expect(store.token).toBe('test-token')
  })

  it('isAdmin returns false when no user', () => {
    const store = useAuthStore()
    expect(store.isAdmin).toBe(false)
  })

  it('isAdmin returns true when user is admin', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ access_token: 'tok', token_type: 'bearer' })
    vi.mocked(authApi.me).mockResolvedValue(mockUser)

    const store = useAuthStore()
    await store.login('admin', 'password')
    expect(store.isAdmin).toBe(true)
  })

  it('login stores token in sessionStorage and loads user', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ access_token: 'abc123', token_type: 'bearer' })
    vi.mocked(authApi.me).mockResolvedValue(mockUser)

    const store = useAuthStore()
    await store.login('admin', 'Admin1234!')

    expect(store.token).toBe('abc123')
    expect(sessionStorage.getItem('token')).toBe('abc123')
    expect(store.user).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
  })

  it('logout clears token, user, and sessionStorage', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ access_token: 'abc123', token_type: 'bearer' })
    vi.mocked(authApi.me).mockResolvedValue(mockUser)

    const store = useAuthStore()
    await store.login('admin', 'Admin1234!')
    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(sessionStorage.getItem('token')).toBeNull()
  })

  it('fetchMe does nothing when no token', async () => {
    const store = useAuthStore()
    await store.fetchMe()
    expect(authApi.me).not.toHaveBeenCalled()
  })
})
