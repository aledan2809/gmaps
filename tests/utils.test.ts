import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentPosition, distanceMeters, formatDistance } from '../src/utils'

describe('getCurrentPosition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error when navigator is undefined (SSR)', async () => {
    // Mock undefined navigator
    const originalNavigator = global.navigator
    // @ts-ignore
    delete global.navigator

    await expect(getCurrentPosition()).rejects.toThrow(
      'getCurrentPosition is only available in browser environments'
    )

    // Restore navigator
    global.navigator = originalNavigator
  })

  it('should throw error when geolocation is not supported', async () => {
    // @ts-ignore
    global.navigator.geolocation = undefined

    await expect(getCurrentPosition()).rejects.toThrow(
      'Geolocation not supported'
    )
  })

  it('should resolve with position when geolocation succeeds', async () => {
    const mockPosition = {
      coords: {
        latitude: 44.4268,
        longitude: 26.1025,
        accuracy: 100,
      },
      timestamp: Date.now(),
    }

    const mockGetCurrentPosition = vi.fn()
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      },
    })

    mockGetCurrentPosition.mockImplementation(
      (success: (position: any) => void) => {
        success(mockPosition)
      }
    )

    const position = await getCurrentPosition()
    expect(position).toBe(mockPosition)
    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  })

  it('should reject when geolocation fails', async () => {
    const mockError = new Error('Permission denied')

    const mockGetCurrentPosition = vi.fn()
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      },
    })

    mockGetCurrentPosition.mockImplementation(
      (_: any, error: (error: Error) => void) => {
        error(mockError)
      }
    )

    await expect(getCurrentPosition()).rejects.toThrow('Permission denied')
  })

  it('should pass custom options to getCurrentPosition', async () => {
    const customOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 30000,
    }

    const mockPosition = {
      coords: { latitude: 44.4268, longitude: 26.1025 },
      timestamp: Date.now(),
    }

    const mockGetCurrentPosition = vi.fn()
    Object.defineProperty(global, 'navigator', {
      writable: true,
      value: {
        geolocation: {
          getCurrentPosition: mockGetCurrentPosition,
        },
      },
    })

    mockGetCurrentPosition.mockImplementation(
      (success: (position: any) => void) => {
        success(mockPosition)
      }
    )

    await getCurrentPosition(customOptions)

    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      customOptions
    )
  })
})

describe('distanceMeters', () => {
  it('should calculate distance between two points correctly', () => {
    // Distance between Bucharest (44.4268, 26.1025) and Cluj-Napoca (46.7712, 23.6236)
    const distance = distanceMeters(44.4268, 26.1025, 46.7712, 23.6236)

    // Expected distance is approximately 320-325km
    expect(distance).toBeCloseTo(322000, -4) // Within 10000m tolerance
  })

  it('should return 0 for identical points', () => {
    const distance = distanceMeters(44.4268, 26.1025, 44.4268, 26.1025)
    expect(distance).toBe(0)
  })

  it('should handle negative coordinates', () => {
    const distance = distanceMeters(-34.6037, -58.3816, -33.4489, -70.6693)
    expect(distance).toBeGreaterThan(0)
  })

  it('should be symmetric (distance A->B equals distance B->A)', () => {
    const distance1 = distanceMeters(44.4268, 26.1025, 46.7712, 23.6236)
    const distance2 = distanceMeters(46.7712, 23.6236, 44.4268, 26.1025)

    expect(distance1).toBeCloseTo(distance2, 5)
  })
})

describe('formatDistance', () => {
  it('should format distances under 1000m as meters', () => {
    expect(formatDistance(0)).toBe('0m')
    expect(formatDistance(50)).toBe('50m')
    expect(formatDistance(350)).toBe('350m')
    expect(formatDistance(999)).toBe('999m')
  })

  it('should format distances over 1000m as kilometers', () => {
    expect(formatDistance(1000)).toBe('1.0km')
    expect(formatDistance(1500)).toBe('1.5km')
    expect(formatDistance(2250)).toBe('2.3km')
    expect(formatDistance(10000)).toBe('10.0km')
  })

  it('should round meters to nearest integer', () => {
    expect(formatDistance(123.4)).toBe('123m')
    expect(formatDistance(123.6)).toBe('124m')
  })

  it('should format kilometers to one decimal place', () => {
    expect(formatDistance(1234)).toBe('1.2km')
    expect(formatDistance(1267)).toBe('1.3km')
  })
})