import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GMapsClient } from '../src/client'
import { GMapsError } from '../src/types'

const mockFetch = vi.mocked(fetch)

describe('GMapsClient', () => {
  let client: GMapsClient

  beforeEach(() => {
    client = new GMapsClient({ apiKey: 'test-api-key' })
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with API key', () => {
      const testClient = new GMapsClient({ apiKey: 'my-key' })
      expect(testClient).toBeInstanceOf(GMapsClient)
    })
  })

  describe('searchPlaces', () => {
    it('should throw error for empty query', async () => {
      await expect(
        client.searchPlaces({ query: '' })
      ).rejects.toThrow(GMapsError)

      await expect(
        client.searchPlaces({ query: '   ' })
      ).rejects.toThrow('Query parameter is required and cannot be empty')
    })

    it('should throw error for non-string query', async () => {
      // @ts-ignore
      await expect(
        client.searchPlaces({ query: null })
      ).rejects.toThrow(GMapsError)
    })

    it('should make correct API call for basic search', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            name: 'Test Gym',
            formatted_address: 'Test Street 123',
            geometry: {
              location: { lat: 44.4268, lng: 26.1025 }
            },
            types: ['gym', 'establishment']
          }
        ]
      }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const results = await client.searchPlaces({ query: 'gym bucharest' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://maps.googleapis.com/maps/api/place/textsearch/json')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=gym+bucharest')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=test-api-key')
      )

      expect(results).toHaveLength(1)
      expect(results[0]).toEqual({
        placeId: 'ChIJ123',
        name: 'Test Gym',
        address: 'Test Street 123',
        lat: 44.4268,
        lng: 26.1025,
        types: ['gym', 'establishment']
      })
    })

    it('should include optional parameters in API call', async () => {
      const mockResponse = { status: 'OK', results: [] }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      await client.searchPlaces({
        query: 'restaurant',
        location: { lat: 44.4268, lng: 26.1025 },
        radius: 5000,
        type: 'restaurant'
      })

      const callUrl = mockFetch.mock.calls[0][0] as string
      expect(callUrl).toContain('location=44.4268%2C26.1025')
      expect(callUrl).toContain('radius=5000')
      expect(callUrl).toContain('type=restaurant')
    })

    it('should handle ZERO_RESULTS status', async () => {
      const mockResponse = { status: 'ZERO_RESULTS', results: [] }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const results = await client.searchPlaces({ query: 'nonexistent place' })
      expect(results).toEqual([])
    })

    it('should throw GMapsError for API errors', async () => {
      const mockResponse = { status: 'REQUEST_DENIED', results: [] }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      await expect(
        client.searchPlaces({ query: 'test' })
      ).rejects.toThrow(GMapsError)

      try {
        await client.searchPlaces({ query: 'test' })
      } catch (error) {
        expect(error).toBeInstanceOf(GMapsError)
        expect((error as GMapsError).status).toBe('REQUEST_DENIED')
      }
    })

    it('should throw error for missing geometry', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            name: 'Test Place',
            formatted_address: 'Test Street',
            // Missing geometry
            types: ['establishment']
          }
        ]
      }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      await expect(
        client.searchPlaces({ query: 'test' })
      ).rejects.toThrow('Invalid place result: missing geometry location')
    })
  })

  describe('searchNearby', () => {
    it('should validate latitude and longitude', async () => {
      await expect(
        // @ts-ignore
        client.searchNearby('invalid', 26.1025)
      ).rejects.toThrow('Latitude and longitude must be valid numbers')

      await expect(
        client.searchNearby(NaN, 26.1025)
      ).rejects.toThrow('Latitude and longitude must be valid numbers')
    })

    it('should validate radius', async () => {
      await expect(
        client.searchNearby(44.4268, 26.1025, -100)
      ).rejects.toThrow('Radius must be a positive number not exceeding 50000 meters')

      await expect(
        client.searchNearby(44.4268, 26.1025, 60000)
      ).rejects.toThrow('Radius must be a positive number not exceeding 50000 meters')
    })

    it('should make correct API call with defaults', async () => {
      const mockResponse = { status: 'OK', results: [] }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      await client.searchNearby(44.4268, 26.1025)

      const callUrl = mockFetch.mock.calls[0][0] as string
      expect(callUrl).toContain('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
      expect(callUrl).toContain('location=44.4268%2C26.1025')
      expect(callUrl).toContain('radius=2000')
      expect(callUrl).toContain('type=gym')
    })

    it('should handle custom radius and type', async () => {
      const mockResponse = { status: 'OK', results: [] }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      await client.searchNearby(44.4268, 26.1025, 1000, 'restaurant')

      const callUrl = mockFetch.mock.calls[0][0] as string
      expect(callUrl).toContain('radius=1000')
      expect(callUrl).toContain('type=restaurant')
    })

    it('should handle results with vicinity instead of formatted_address', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            name: 'Test Restaurant',
            vicinity: 'Near Central Park',
            geometry: {
              location: { lat: 44.4268, lng: 26.1025 }
            },
            types: ['restaurant']
          }
        ]
      }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const results = await client.searchNearby(44.4268, 26.1025)

      expect(results[0].address).toBe('Near Central Park')
    })
  })

  describe('geocode', () => {
    it('should validate address parameter', async () => {
      await expect(
        client.geocode('')
      ).rejects.toThrow('Address parameter is required and cannot be empty')

      // @ts-ignore
      await expect(
        client.geocode(null)
      ).rejects.toThrow('Address parameter is required and cannot be empty')
    })

    it('should make correct API call', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            formatted_address: 'Calea Victoriei 12, București',
            geometry: {
              location: { lat: 44.4378, lng: 26.0969 }
            }
          }
        ]
      }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const result = await client.geocode('Calea Victoriei 12, Bucharest')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://maps.googleapis.com/maps/api/geocode/json')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('address=Calea+Victoriei+12%2C+Bucharest')
      )

      expect(result).toEqual({
        placeId: 'ChIJ123',
        address: 'Calea Victoriei 12, București',
        lat: 44.4378,
        lng: 26.0969
      })
    })

    it('should return null for ZERO_RESULTS', async () => {
      const mockResponse = { status: 'ZERO_RESULTS', results: [] }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const result = await client.geocode('nonexistent address')
      expect(result).toBeNull()
    })

    it('should throw error for missing geometry', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            formatted_address: 'Test Address'
            // Missing geometry
          }
        ]
      }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      await expect(
        client.geocode('test address')
      ).rejects.toThrow('Invalid geocoding result: missing geometry location')
    })
  })

  describe('reverseGeocode', () => {
    it('should validate coordinates', async () => {
      await expect(
        // @ts-ignore
        client.reverseGeocode({ lat: 'invalid', lng: 26.1025 })
      ).rejects.toThrow('Latitude and longitude must be valid numbers')

      await expect(
        client.reverseGeocode({ lat: NaN, lng: 26.1025 })
      ).rejects.toThrow('Latitude and longitude must be valid numbers')
    })

    it('should make correct API call', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            place_id: 'ChIJ123',
            formatted_address: 'Calea Victoriei 12, București',
            geometry: {
              location: { lat: 44.4378, lng: 26.0969 }
            }
          }
        ]
      }

      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any)

      const result = await client.reverseGeocode({ lat: 44.4378, lng: 26.0969 })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('latlng=44.4378%2C26.0969')
      )

      expect(result).toEqual({
        placeId: 'ChIJ123',
        address: 'Calea Victoriei 12, București',
        lat: 44.4378,
        lng: 26.0969
      })
    })
  })

  describe('getScriptUrl', () => {
    it('should generate correct URL with default libraries', () => {
      const url = client.getScriptUrl()

      expect(url).toBe(
        'https://maps.googleapis.com/maps/api/js?key=test-api-key&libraries=places%2Cmarker'
      )
    })

    it('should generate correct URL with custom libraries', () => {
      const url = client.getScriptUrl(['geometry', 'places'])

      expect(url).toBe(
        'https://maps.googleapis.com/maps/api/js?key=test-api-key&libraries=geometry%2Cplaces'
      )
    })

    it('should handle empty libraries array', () => {
      const url = client.getScriptUrl([])

      expect(url).toBe(
        'https://maps.googleapis.com/maps/api/js?key=test-api-key&libraries='
      )
    })
  })
})