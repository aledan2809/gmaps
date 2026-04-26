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

## Governance Reference
See: `Master/knowledge/MASTER_SYSTEM.md` §1-§5. This library follows Master governance; do not duplicate rules.
This is a shared library — modifications cascade to consumers (per `Master/CLASSIFICATION.md` §6.1). Before any patch / rebuild / rsync that affects `dist/`:
1. List consumers: `grep -lE "\"@aledan/<libname>\"" $PROJECTS_ROOT/*/package.json`
2. If any consumer is NO-TOUCH CRITIC (PRO, eCabinet, Tester, 4uPDF, procuchaingo2), apply propose-confirm-apply protocol per Master `CLAUDE.md` §2d.
3. Never use `rsync --delete` on `dist/` — preserves CJS/ESM format variants referenced by `exports` map.
4. Post-deploy, spot-check NO-TOUCH consumer health (Master `CLASSIFICATION.md` §6.1).
