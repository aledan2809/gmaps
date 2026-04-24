# @aledan/gmaps

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![npm version](https://img.shields.io/npm/v/@aledan/gmaps.svg)](https://www.npmjs.com/package/@aledan/gmaps)

A modern TypeScript library for Google Maps Platform APIs with full type safety and comprehensive error handling.

## Features

- 🔍 **Places API**: Search places by text or location
- 🌍 **Geocoding API**: Convert addresses to coordinates and vice versa
- 📍 **Geolocation Utils**: Get current position with browser support
- 📏 **Distance Calculations**: Haversine distance calculations
- 🎯 **JavaScript API Integration**: Generate script URLs for map embedding
- ✅ **Full TypeScript Support**: Complete type definitions
- 🛡️ **Robust Error Handling**: Comprehensive validation and error types
- 🌐 **Universal Support**: Works in browser and Node.js environments
- 📦 **Dual Module Support**: CommonJS and ESM builds

## Installation

```bash
npm install @aledan/gmaps
```

## Setup

Get your Google Maps Platform API key from the [Google Cloud Console](https://console.cloud.google.com/).

### Required APIs
Enable these APIs in your Google Cloud project:
- Places API
- Geocoding API
- Maps JavaScript API (if using `getScriptUrl`)

### Security Note
**Never expose your API key in client-side code.** Use environment variables or server-side proxy endpoints for production applications.

## Quick Start

```typescript
import { GMapsClient, getCurrentPosition } from '@aledan/gmaps'

const client = new GMapsClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY!
})

// Search for places
const gyms = await client.searchPlaces({
  query: 'gyms in Bucharest',
  radius: 5000
})

// Get current location (browser only)
const position = await getCurrentPosition()
const nearby = await client.searchNearby(
  position.coords.latitude,
  position.coords.longitude,
  2000,
  'restaurant'
)
```

## API Reference

### GMapsClient

#### Constructor

```typescript
const client = new GMapsClient({ apiKey: string })
```

#### Methods

##### `searchPlaces(options: PlaceSearchOptions): Promise<PlaceResult[]>`

Search for places using text queries.

```typescript
const places = await client.searchPlaces({
  query: 'World Class gym Bucharest',
  location: { lat: 44.4268, lng: 26.1025 }, // optional
  radius: 5000, // optional, meters
  type: 'gym' // optional
})

// Returns:
// [{
//   placeId: 'ChIJ...',
//   name: 'World Class Veranda Mall',
//   address: 'Calea Floreasca 246-248, București',
//   lat: 44.4723,
//   lng: 26.1178,
//   types: ['gym', 'health', 'establishment']
// }]
```

##### `searchNearby(lat: number, lng: number, radius?: number, type?: string): Promise<PlaceResult[]>`

Find places near a specific location.

```typescript
const restaurants = await client.searchNearby(
  44.4268, // latitude
  26.1025, // longitude
  1000,    // radius in meters (default: 2000)
  'restaurant' // place type (default: 'gym')
)
```

##### `geocode(address: string): Promise<GeocodingResult | null>`

Convert an address to coordinates.

```typescript
const result = await client.geocode('Calea Victoriei 12, Bucharest')
// Returns: { placeId: '...', address: '...', lat: 44.4378, lng: 26.0969 }
```

##### `reverseGeocode(options: ReverseGeocodeOptions): Promise<GeocodingResult | null>`

Convert coordinates to an address.

```typescript
const address = await client.reverseGeocode({
  lat: 44.4378,
  lng: 26.0969
})
// Returns: { placeId: '...', address: 'Calea Victoriei 12, București', lat: 44.4378, lng: 26.0969 }
```

##### `getScriptUrl(libraries?: string[]): string`

Generate Google Maps JavaScript API script URL for embedding maps.

```typescript
const scriptUrl = client.getScriptUrl(['places', 'marker'])
// Returns: 'https://maps.googleapis.com/maps/api/js?key=...&libraries=places,marker'

// Use in React:
useEffect(() => {
  const script = document.createElement('script')
  script.src = scriptUrl
  document.head.appendChild(script)
}, [])
```

### Utility Functions

#### `getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition>`

Get user's current location (browser only).

```typescript
import { getCurrentPosition } from '@aledan/gmaps'

try {
  const position = await getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000
  })
  console.log(position.coords.latitude, position.coords.longitude)
} catch (error) {
  // Handle permission denied or other errors
}
```

#### `distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number`

Calculate distance between two points using Haversine formula.

```typescript
import { distanceMeters } from '@aledan/gmaps'

const distance = distanceMeters(44.4268, 26.1025, 44.4378, 26.0969)
console.log(distance) // Distance in meters
```

#### `formatDistance(meters: number): string`

Format distance for display.

```typescript
import { formatDistance } from '@aledan/gmaps'

console.log(formatDistance(500))   // "500m"
console.log(formatDistance(1500))  // "1.5km"
```

## Types

```typescript
interface GMapsConfig {
  apiKey: string
}

interface PlaceResult {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
}

interface GeocodingResult {
  placeId: string
  address: string
  lat: number
  lng: number
}

interface PlaceSearchOptions {
  query: string
  location?: { lat: number; lng: number }
  radius?: number // meters
  type?: string
}

interface ReverseGeocodeOptions {
  lat: number
  lng: number
}

class GMapsError extends Error {
  constructor(message: string, status: string, code?: number)
}
```

## Error Handling

The library throws `GMapsError` for all API-related errors:

```typescript
import { GMapsError } from '@aledan/gmaps'

try {
  await client.searchPlaces({ query: '' })
} catch (error) {
  if (error instanceof GMapsError) {
    console.log('Status:', error.status)
    console.log('Message:', error.message)
  }
}
```

Common error statuses:
- `INVALID_REQUEST` - Invalid or missing parameters
- `OVER_QUERY_LIMIT` - API quota exceeded
- `REQUEST_DENIED` - API key invalid or missing permissions
- `ZERO_RESULTS` - No results found (handled automatically)

## Environment Support

### Browser
All features work in modern browsers. `getCurrentPosition` requires HTTPS in production.

### Node.js / Server-side
All features work except `getCurrentPosition` which requires browser environment.

```typescript
// ✅ Works in Node.js
await client.searchPlaces({ query: 'restaurants' })

// ❌ Browser only
await getCurrentPosition() // Throws error in Node.js
```

## Examples

### Next.js App Router

```typescript
// app/api/places/route.ts
import { GMapsClient } from '@aledan/gmaps'

const client = new GMapsClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY!
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return Response.json({ error: 'Query required' }, { status: 400 })
  }

  try {
    const places = await client.searchPlaces({ query })
    return Response.json({ places })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
```

### React Component

```tsx
import { GMapsClient, getCurrentPosition, formatDistance } from '@aledan/gmaps'
import { useState, useEffect } from 'react'

const client = new GMapsClient({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
})

export default function NearbyPlaces() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function findNearbyPlaces() {
      try {
        const position = await getCurrentPosition()
        const nearby = await client.searchNearby(
          position.coords.latitude,
          position.coords.longitude,
          1000,
          'restaurant'
        )
        setPlaces(nearby)
      } catch (error) {
        console.error('Failed to find places:', error)
      } finally {
        setLoading(false)
      }
    }

    findNearbyPlaces()
  }, [])

  return (
    <div>
      <h2>Nearby Restaurants</h2>
      {loading ? (
        <p>Finding restaurants...</p>
      ) : (
        <ul>
          {places.map(place => (
            <li key={place.placeId}>
              <h3>{place.name}</h3>
              <p>{place.address}</p>
              <p>Types: {place.types.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin my-feature`
5. Submit a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.