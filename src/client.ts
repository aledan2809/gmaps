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

    return (data.results || []).map((r: Record<string, unknown>) => ({
      placeId: r.place_id as string,
      name: r.name as string,
      address: r.formatted_address as string,
      lat: (r.geometry as { location: { lat: number; lng: number } }).location.lat,
      lng: (r.geometry as { location: { lat: number; lng: number } }).location.lng,
      types: r.types as string[],
    }))
  }

  /**
   * Search for nearby places by type
   */
  async searchNearby(lat: number, lng: number, radius: number = 2000, type: string = 'gym'): Promise<PlaceResult[]> {
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

    return (data.results || []).map((r: Record<string, unknown>) => ({
      placeId: r.place_id as string,
      name: r.name as string,
      address: r.formatted_address as string || (r.vicinity as string) || '',
      lat: (r.geometry as { location: { lat: number; lng: number } }).location.lat,
      lng: (r.geometry as { location: { lat: number; lng: number } }).location.lng,
      types: r.types as string[],
    }))
  }

  /**
   * Geocode an address to lat/lng
   */
  async geocode(address: string): Promise<GeocodingResult | null> {
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
