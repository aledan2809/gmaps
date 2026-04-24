import type { GMapsConfig, PlaceResult, GeocodingResult, PlaceSearchOptions, ReverseGeocodeOptions } from './types'
import { GMapsError } from './types'

const PLACES_API = 'https://maps.googleapis.com/maps/api/place'
const GEOCODE_API = 'https://maps.googleapis.com/maps/api/geocode/json'

export class GMapsClient {
  private apiKey: string

  constructor(config: GMapsConfig) {
    this.apiKey = config.apiKey
  }

  /**
   * Search for places by text query (e.g., "World Class gym Bucharest")
   */
  async searchPlaces(options: PlaceSearchOptions): Promise<PlaceResult[]> {
    if (!options.query || typeof options.query !== 'string' || options.query.trim() === '') {
      throw new GMapsError('Query parameter is required and cannot be empty', 'INVALID_REQUEST')
    }

    const params = new URLSearchParams({
      query: options.query,
      key: this.apiKey,
    })

    if (options.location) {
      params.set('location', `${options.location.lat},${options.location.lng}`)
    }
    if (options.radius) {
      params.set('radius', String(options.radius))
    }
    if (options.type) {
      params.set('type', options.type)
    }

    const res = await fetch(`${PLACES_API}/textsearch/json?${params}`)
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new GMapsError(`Places search failed: ${data.status}`, data.status)
    }

    return (data.results || []).map((r: Record<string, unknown>) => {
      const geometry = r.geometry as { location?: { lat: number; lng: number } } | undefined
      if (!geometry?.location?.lat || !geometry?.location?.lng) {
        throw new GMapsError('Invalid place result: missing geometry location', 'INVALID_RESPONSE')
      }

      return {
        placeId: r.place_id as string,
        name: r.name as string,
        address: r.formatted_address as string,
        lat: geometry.location.lat,
        lng: geometry.location.lng,
        types: r.types as string[],
      }
    })
  }

  /**
   * Search for nearby places by type
   */
  async searchNearby(lat: number, lng: number, radius: number = 2000, type: string = 'gym'): Promise<PlaceResult[]> {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      throw new GMapsError('Latitude and longitude must be valid numbers', 'INVALID_REQUEST')
    }
    if (typeof radius !== 'number' || radius <= 0 || radius > 50000) {
      throw new GMapsError('Radius must be a positive number not exceeding 50000 meters', 'INVALID_REQUEST')
    }

    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: String(radius),
      type,
      key: this.apiKey,
    })

    const res = await fetch(`${PLACES_API}/nearbysearch/json?${params}`)
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new GMapsError(`Nearby search failed: ${data.status}`, data.status)
    }

    return (data.results || []).map((r: Record<string, unknown>) => {
      const geometry = r.geometry as { location?: { lat: number; lng: number } } | undefined
      if (!geometry?.location?.lat || !geometry?.location?.lng) {
        throw new GMapsError('Invalid place result: missing geometry location', 'INVALID_RESPONSE')
      }

      return {
        placeId: r.place_id as string,
        name: r.name as string,
        address: r.formatted_address as string || (r.vicinity as string) || '',
        lat: geometry.location.lat,
        lng: geometry.location.lng,
        types: r.types as string[],
      }
    })
  }

  /**
   * Geocode an address to lat/lng
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new GMapsError('Address parameter is required and cannot be empty', 'INVALID_REQUEST')
    }

    const params = new URLSearchParams({
      address,
      key: this.apiKey,
    })

    const res = await fetch(`${GEOCODE_API}?${params}`)
    const data = await res.json()

    if (data.status === 'ZERO_RESULTS') return null
    if (data.status !== 'OK') {
      throw new GMapsError(`Geocoding failed: ${data.status}`, data.status)
    }

    const result = data.results[0]
    if (!result?.geometry?.location?.lat || !result?.geometry?.location?.lng) {
      throw new GMapsError('Invalid geocoding result: missing geometry location', 'INVALID_RESPONSE')
    }

    return {
      placeId: result.place_id,
      address: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    }
  }

  /**
   * Reverse geocode lat/lng to address
   */
  async reverseGeocode(options: ReverseGeocodeOptions): Promise<GeocodingResult | null> {
    if (typeof options.lat !== 'number' || typeof options.lng !== 'number' || isNaN(options.lat) || isNaN(options.lng)) {
      throw new GMapsError('Latitude and longitude must be valid numbers', 'INVALID_REQUEST')
    }

    const params = new URLSearchParams({
      latlng: `${options.lat},${options.lng}`,
      key: this.apiKey,
    })

    const res = await fetch(`${GEOCODE_API}?${params}`)
    const data = await res.json()

    if (data.status === 'ZERO_RESULTS') return null
    if (data.status !== 'OK') {
      throw new GMapsError(`Reverse geocoding failed: ${data.status}`, data.status)
    }

    const result = data.results[0]
    if (!result?.geometry?.location?.lat || !result?.geometry?.location?.lng) {
      throw new GMapsError('Invalid reverse geocoding result: missing geometry location', 'INVALID_RESPONSE')
    }

    return {
      placeId: result.place_id,
      address: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    }
  }

  /**
   * Get the Maps JavaScript API script URL (for embedding maps in React)
   */
  getScriptUrl(libraries: string[] = ['places', 'marker']): string {
    const params = new URLSearchParams({
      key: this.apiKey,
      libraries: libraries.join(','),
    })
    return `https://maps.googleapis.com/maps/api/js?${params}`
  }
}
