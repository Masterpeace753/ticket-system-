import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock axios module before importing api modules
vi.mock('@/api/axios', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }
  return { default: mockApi }
})

import api from '@/api/axios'
import { authApi } from '@/api/auth'

const mockUser = {
  id: 1,
  username: 'admin',
  display_name: 'Admin',
  email: 'admin@example.com',
  is_active: true,
  is_admin: true,
  created_at: '2026-04-19T00:00:00Z',
}

describe('authApi', () => {
  beforeEach(() => vi.clearAllMocks())

  it('login posts to /auth/login and returns token data', async () => {
    const tokenResponse = { access_token: 'tok123', token_type: 'bearer' }
    vi.mocked(api.post).mockResolvedValue({ data: tokenResponse })

    const result = await authApi.login('admin', 'Admin1234!')

    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'admin', password: 'Admin1234!' })
    expect(result).toEqual(tokenResponse)
  })

  it('me calls GET /auth/me and returns user', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: mockUser })

    const result = await authApi.me()

    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(mockUser)
  })
})
