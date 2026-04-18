# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Type-check and build for production
npm run lint      # Run ESLint
npm run test      # Run Playwright tests
```

## Architecture

Word War is a **Preact + TypeScript + Vite** web app — a physical card game companion. Players share a seed to generate identical shuffled decks, then each selects their player count and starting position to receive their individual subset of cards.

### State flow

All game state lives in `App` (`src/app.tsx`) and flows down as props. Three pages are rendered conditionally: `menu → game → results`. No routing library — just a `Page` type (`"menu" | "game" | "results"`) and a switch.

- **Menu**: Configures seed, player count, and player position. Builds the player's card subset using `mulberry32` (seeded PRNG from `src/lib/random.ts`) and Fisher-Yates shuffle.
- **Game**: Manages a virtual deck (index into `playerDeck.cards`) and a physical deck (array of dealt cards). "Next card" advances the virtual position and pushes to the physical stack; "X" pops the top card; trophy button increments points.
- **Results**: Shows final points and resets.

### Key types (`src/types.ts`)

All types are defined with Zod schemas and inferred from them:
- `Card` — `{ category: string, cardSymbol: CardSymbol }`
- `Deck` — `{ cards: Card[] }`
- `PlayerState` — `{ points, physicalDeck, virtualDeckPosition }`
- `CardSymbol` — enum of 7 SVG symbol names (files live in `public/symbols/`)

### Data

- `src/data/packs.ts` — named category packs (`CategoryPack` type); `categoryPacks` record holds 6 packs (standard, popCulture, nerd, world, sports, nature); `DEFAULT_PACK_KEY = "standard"`
- Symbol assignment is randomized per-card using a fixed seed (`SYMBOL_SEED = 1234`), separate from the game seed, so symbols are consistent across reruns

### UI

- `src/components/ui/` — shadcn-style primitives (Button, Input, Label, Field, Separator) using `class-variance-authority` and Tailwind
- `src/components/playingCard/` — the physical card component; uses CSS custom properties `--card-width` and `--symbol-size` for sizing
- Path alias `@` maps to `src/`
- Tailwind v4 (configured via `@tailwindcss/vite` plugin, no config file)
