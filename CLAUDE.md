# @aledan/gmaps — Google Maps Platform Library

## Overview
Reusable TypeScript library for Google Maps Platform APIs. Full type safety, zero runtime deps (native fetch).

## Stack
- **Language**: TypeScript 5 (strict mode)
- **Build**: tsup (CJS + ESM + .d.ts)
- **Testing**: Vitest — 44 tests, 96.49% coverage
- **Target**: ES2022, Node.js 18+
- **Dependency**: `ai-router` (local, exports routeAI for consumers)

## Build & Test
```bash
npm run build    # CJS + ESM + types
npm run dev      # Watch mode
npm test         # Vitest
```

## Features
- Text search & nearby search (Places API)
- Geocoding & reverse geocoding
- Browser geolocation
- Distance calculation (Haversine)
- AI Router integration (exported for consuming projects)

## Consumers
- PRO, eCabinet, and any project needing Google Maps

## DO NOT MODIFY
- Public API signatures in `src/types.ts` (breaking change for consumers)
- Test mocks in `tests/setup.ts`
- Export structure in `src/index.ts`

## Env Vars (consuming project)
```
GOOGLE_MAPS_API_KEY=...
```
