# Dofusdle — Implementation Plan

## Context

Build **Dofusdle**, a Wordle-style daily guessing game for Dofus Retro 1.29 monsters. The first (and only for now) section is **Dofus Retro 1.29** — guess monsters by their attributes. The architecture allows adding more Ankama games later (Wakfu, Dofus Touch, etc.).

---

## Tech Stack

- **React 18 + Vite** — fast, modern SPA
- **TypeScript** — type safety for game logic
- **Plain CSS** — lightweight styling, no extra deps
- **No backend** — fully client-side; daily monster selected via date-based seeding
- **localStorage** — persist daily progress, streak stats

---

## Game Rules

- **One monster per day**, same for all players (seeded from date)
- Player types a monster name in a search bar (autocomplete from monster list)
- Each guess shows a row with **5 attribute columns**, each colored:
  - 🟢 Vert = exact match
  - 🟠 Orange = partial match (same zone group, close level/HP range)
  - 🔴 Rouge = no match
  - ⬆️/⬇️ arrows for numeric values (Niveau, PV)
- Game ends when the monster is found
- Stats: number of guesses, streak, share button (emoji grid)

---

## Monster Attributes (5 columns)

| Attribute       | Type   | Feedback                                                    |
| --------------- | ------ | ----------------------------------------------------------- |
| **Type**        | String | Exact match or not                                          |
| **Zone**        | String | Exact = vert, same region = orange, different = rouge       |
| **Niveau**      | Number | Exact = vert, ±10 = orange + arrow, far = rouge + arrow    |
| **Couleur**     | String | Exact or partial match if multi-colored                     |
| **Points de vie** | Number | Exact = vert, ±20% = orange + arrow, far = rouge + arrow |

---

## Project Structure

```
dofusdle/
├── public/
│   └── images/                # Monster sprites (added later)
├── src/
│   ├── data/
│   │   └── monsters.json      # Dofus Retro monster dataset
│   ├── components/
│   │   ├── App.tsx             # Main app wrapper
│   │   ├── DofusRetro/
│   │   │   ├── Game.tsx        # Core game logic & state
│   │   │   ├── SearchBar.tsx   # Autocomplete monster search input
│   │   │   ├── GuessRow.tsx    # Single guess row with 5 attribute cells
│   │   │   ├── GuessGrid.tsx   # List of all guess rows
│   │   │   ├── AttributeCell.tsx # Individual cell (colored feedback)
│   │   │   └── Victory.tsx     # Win modal with stats & share
│   │   └── Header.tsx          # Title, nav, rules
│   ├── utils/
│   │   ├── daily.ts            # Date-based seeding for daily monster
│   │   ├── compare.ts          # Attribute comparison logic
│   │   └── storage.ts          # localStorage helpers
│   ├── styles/
│   │   └── app.css             # Global styles
│   ├── types.ts                # TypeScript interfaces
│   └── main.tsx                # Vite entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Implementation Steps

### Step 1: Project Scaffold
- Create Vite + React-TS project
- Set up folder structure
- Clean out Vite boilerplate

### Step 2: Types & Data
- Define `Monster`, `GuessResult`, `AttributeFeedback` interfaces in `types.ts`
- Create `monsters.json` with ~10 starter Dofus Retro monsters
- Implement `daily.ts`: deterministic daily monster via date-based hash

### Step 3: Core Game Logic
- `compare.ts` — `compareMonsters(guess, target)` returns feedback per attribute
- Handle exact / partial / wrong states
- Numeric comparisons with thresholds and directional arrows

### Step 4: Persistence
- `storage.ts` — save/load today's guesses (keyed by date)
- Track stats: games played, win %, current streak, max streak, guess distribution

### Step 5: Components (bottom-up)
1. **AttributeCell** — single cell with color + optional arrow
2. **GuessRow** — 5 AttributeCells for one guess
3. **GuessGrid** — stacks all GuessRows
4. **SearchBar** — text input with filtered autocomplete dropdown
5. **Game** — orchestrates state: guesses, daily monster, win detection
6. **Victory** — modal with guess count, streak, share-to-clipboard
7. **Header** — "Dofusdle" title, rules modal
8. **App** — wraps Header + Game

### Step 6: Styling
- Dark theme with Dofus-inspired colors
- Green / orange / red feedback cells
- Responsive (mobile-friendly)
- Smooth row reveal animations

---

## Daily Monster Selection

```ts
function getDailyMonster(monsters: Monster[]): Monster {
  const today = new Date();
  const seed = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let hash = 0;
  for (const ch of seed) hash = ((hash << 5) - hash) + ch.charCodeAt(0);
  return monsters[Math.abs(hash) % monsters.length];
}
```

---

## Verification Checklist

- [ ] `npm run dev` loads — shows "Dofusdle" header + Dofus Retro game
- [ ] Type a monster name → autocomplete suggests matches
- [ ] Submit a guess → row appears with colored feedback
- [ ] Guess correctly → victory modal with stats + share button
- [ ] Refresh page → progress restored from localStorage
- [ ] Change system date → different daily monster
