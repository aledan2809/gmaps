export interface GMapsConfig {
  apiKey: string
}

export interface PlaceResult {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
}

export interface GeocodingResult {
  placeId: string
  address: string
  lat: number
  lng: number
}

export interface PlaceSearchOptions {
  query: string
  location?: { lat: number; lng: number }
  radius?: number // meters
  type?: string // e.g. 'gym', 'establishment'
}

export interface ReverseGeocodeOptions {
  lat: number
  lng: number
}

export class GMapsError extends Error {
  constructor(
    message: string,
    public status: string,
    public code?: number
  ) {
    super(message)
    this.name = 'GMapsError'
  }
}
