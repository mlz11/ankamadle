# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
npm run lint         # Biome lint check
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format all files with Biome
```

No test runner is configured. There are no tests.

## Code Style

- **Formatter**: Biome with tab indentation and double quotes for JS/TS
- **Linting**: Biome recommended rules (a11y `noStaticElementInteractions` disabled)
- **Commits**: Conventional commits enforced via commitlint (`feat:`, `fix:`, `build:`, etc.)
- **Git hooks**: Pre-commit runs `npm run lint`; commit-msg validates conventional commit format

## Architecture

Dofusdle is a client-side Wordle-style daily guessing game for Dofus Retro 1.29 monsters. No backend — fully static Vite + React 19 SPA.

### Core Data Flow

1. **Daily monster selection** (`src/utils/daily.ts`): Deterministic hash of today's date selects a monster from `src/data/monsters.json`. Same monster for all players each day.
2. **Guess comparison** (`src/utils/compare.ts`): Each guess produces feedback on 5 attributes (type, zone, niveau, couleur, pv) with statuses: correct/partial/wrong and directional arrows for numeric fields. Zone comparison uses a region grouping map for partial matches. Numeric thresholds: niveau ±10, pv ±20%.
3. **Persistence** (`src/utils/storage.ts`): Daily progress and cumulative stats stored in localStorage (`dofusdle-progress`, `dofusdle-stats`). Progress auto-clears when the date changes.

### Component Structure

`Game.tsx` is the main orchestrator under `src/components/DofusRetro/`. It owns all game state (guesses, win status, stats) and delegates to:
- `SearchBar` — autocomplete input with keyboard navigation
- `GuessGrid` → `GuessRow` → `AttributeCell` — renders guess results with flip animations
- `Victory` — win modal with stats and emoji share

Components are organized under `src/components/DofusRetro/` to allow future game modes for other Ankama titles (each would get its own directory).

### Key Types (`src/types.ts`)

- `Monster` — id, name, type, zone, niveau, couleur, pv, image?
- `GuessResult` — monster + feedback map of `AttributeFeedback` (value, status, arrow)
- `GameStats` / `DailyProgress` — localStorage-persisted structures
