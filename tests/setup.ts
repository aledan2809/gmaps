import { vi } from 'vitest'

// Mock global fetch
global.fetch = vi.fn()

// Mock navigator.geolocation for getCurrentPosition tests
Object.defineProperty(global, 'navigator', {
  writable: true,
  value: {
    geolocation: {
      getCurrentPosition: vi.fn(),
    },
  },
})

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})