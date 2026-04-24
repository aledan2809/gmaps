# Lessons Learned — @aledan/gmaps

> Incident root causes and patterns specific to the @aledan/gmaps shared library.
> Master-level lessons: `Master/knowledge/lessons-learned.md`.
> When a lesson derives from a Master-level pattern, cross-reference `Master L##`.

## Lessons

#### L01: Shared lib commit without version bump leaves consumers unable to pin
- **Date**: 2026-04-24
- **Category**: Shared libraries / Versioning
- **Lesson**: Recovery commit `e12db54` pushed to GitHub master but did NOT bump `package.json` version or create a git tag. Consumers (today: none active; tomorrow: potentially any Maps-using project) cannot pin to "latest features as of 2026-04-24" — they either `npm install @aledan/gmaps#master` (tracks branch, unstable) or stay at whatever version they already had. Version semantics lost.
- **Action**: (1) **Phase 1b** (next session): run `npm version patch` on this project, commit `package.json` update, tag with `git tag v0.x.y && git push origin v0.x.y`. Publishing to npm is optional at this stage (no active consumers), but tagging makes the HEAD at that commit referenceable. (2) **Discipline for shared libs**: every commit that ships non-trivial changes = version bump. Even unreleased libs should bump in `0.0.x` range so internal history is queryable. (3) Cross-ref `Master L46` — version bump discipline generalizes across all @aledan/* libs.

#### L02: No consumers today means deferred risk if/when adoption starts
- **Date**: 2026-04-24
- **Category**: Library design / Adoption readiness
- **Lesson**: GMaps has been built but has zero production consumers per ECOSYSTEM_REGISTRY.md. This means the API surface has never been stress-tested against real integration. When the first consumer arrives, every papercut in the API (missing types, awkward function signatures, unclear error modes) will surface at once. The 20d-stale WIP suggests incremental polish was underway but never finalized.
- **Action**: (1) **README audit**: does it have at least one end-to-end import example? A list of "tested by" projects? Output types for every exported function? If no — add before marking "adoption-ready". (2) **Dogfood test**: pick one existing Master project where Google Maps geocoding would add value (Myholiday? source?) and actually import + use it. First consumer exposes hidden assumptions. (3) Keep in CLASSIFICATION.md ACTIVE — adoption-readiness work is legitimate.

---

## How to Add New Lessons

1. Identify the lesson from your project work
2. Add it under an appropriate category
3. Follow the format above
4. Cross-reference Master L## if the pattern applies broadly

Claude should update this file automatically when significant lessons are learned during development.
