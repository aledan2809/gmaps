export { GMapsClient } from './client'
export type {
  GMapsConfig,
  PlaceResult,
  GeocodingResult,
  PlaceSearchOptions,
  ReverseGeocodeOptions,
} from './types'
export { GMapsError } from './types'
export { getCurrentPosition, distanceMeters, formatDistance } from './utils'
export { routeAI, aiRouter, router } from './lib/ai-router'
export type { AIRequest, AIResponse } from './lib/ai-router'
