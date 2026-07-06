# UI Guidelines

Phase 7 defines ReDevOps Lab as a technical developer tool: dark, focused, evidence-driven, and practical.

## Palette

- Background: `#050A0F`
- Surface: `#0B1220`
- Elevated surface: `#111827`
- Border: `#1E293B`
- Green: `#22C55E`
- Blue: `#38BDF8`
- Violet: `#8B5CF6`
- Amber: `#F59E0B`
- Red: `#EF4444`
- Main text: `#E5E7EB`
- Muted text: `#94A3B8`

## Typography

- Primary font: Geist Sans
- Mono font: Geist Mono
- Use mono text for repository paths, terminal output, report IDs, runtime config, and evidence.
- Avoid oversized type inside compact panels. Reserve hero-scale type for landing and primary page headings.

## Core Components

- Hero analyzer input for quick entry into `/analyze`.
- Segment controls for level, language, and mentor mode.
- Progress pipeline for non-streaming analysis feedback.
- Score card with ring, maturity badge, and rule-based score microcopy.
- Category bars for score breakdown.
- Production checklist cards with status, priority, category, and evidence.
- Learning path timeline with topics, related files, and related labs.
- Lab cards with objective, rationale, steps, suggested files, and validation.
- AI mentor panel that explains deterministic facts without replacing them.

## UX Principles

- Evidence first: analyzer facts and score rules are the source of truth.
- AI second: mentor guidance explains and prioritizes, but does not change report facts.
- Keep public-repo boundaries clear.
- Prefer actionable errors with a retry path and demo fallback.
- Avoid horizontal overflow from long repository paths by wrapping file names and URLs.
- Keep responsive layouts stacked and readable on mobile.

## Current Boundaries

- No login, database, private repositories, billing, autonomous agents, or real deployment automation.
- AI provider keys must stay backend-only.
- Loading progress is frontend-controlled; it is not streaming from the API yet.
