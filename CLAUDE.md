# Tower Defense — Project Spec

## Stack
- **React 18** + **TypeScript** + **Vite**
- HTML Canvas for all game rendering (no game framework)
- Run: `npm install && npm run dev` from the repo root

## Architecture

```
src/
  settings.ts   — all constants (grid, colors, waypoints). No logic.
  map.ts        — GameMap class: tile layout, path, buildability, Canvas rendering
  enemy.ts      — Enemy base class + Basic, Fast, Tank subclasses
  waves.ts      — WaveManager (spawning, tracking) + per-round spawn config
  tower.ts      — Tower base class + Basic subclass; owns projectile list
  projectile.ts — Projectile class; home-seeks target, calls takeDamage on hit
  Game.tsx      — Canvas component: requestAnimationFrame loop, HUD, event handling
  App.tsx       — Minimal React wrapper (centers canvas on dark background)
  main.tsx      — React entry point
```

### Key concepts
- **Grid**: 20 cols × 15 rows, each tile 40×40 px. Game area is 800×600.
- **Window**: 800×680 — the extra 80px at the bottom is the UI bar. `GAME_HEIGHT` is the boundary between game area and UI bar; never render game entities below it.
- **Waypoints**: defined in `settings.WAYPOINTS` as `[col, row]` pairs forming an S-shaped path. `GameMap.waypointPixels` is the dense pixel-center list passed to enemies.
- **GameMap.occupied**: Set of `"col,row"` strings for tiles blocked by towers.
- **Game loop**: `requestAnimationFrame` inside a `useEffect` in `Game.tsx`. All mutable game state lives in local variables captured by the closure (not React state) to avoid re-renders mid-frame.

## Conventions
- All colors and grid constants live in `settings.ts`. Never hardcode them elsewhere.
- New game entities each get their own module with `update(dt: number)` and `draw(ctx: CanvasRenderingContext2D)` methods.
- `dt` is always in **seconds**, capped at 50 ms to survive tab focus loss.
- Coordinates: tile space is `[col, row]`, pixel space is `[x, y]`. Keep them separate and convert explicitly via `GameMap.pixelToTile`.
- Static class properties carry the entity spec (DAMAGE, SPEED, COST, etc.); the constructor copies them to instance fields so runtime code never needs to reference the constructor.

---

## Game Design

### Game loop — two phases per round
1. **Build phase** — player places towers using gold. SPACE ends the phase and spawns the wave.
2. **Combat phase** — enemy wave walks the path. Player cannot place towers. Phase ends when all enemies are dead or have leaked.

### Economy
- Player starts with 225 gold.
- Placing a tower costs gold (varies by tower type). Right-click during build phase refunds towers placed that round.
- Killing an enemy awards its `gold` value. Gold carries over between rounds.

### Progression
- Each round spawns more enemies and introduces tougher/faster variants.
- Every **5th round is a Boss round** — heavy mix of all types.

### Scoring
- Each killed enemy awards its `score` value. Track a running total displayed in the HUD.

---

## Entity Specs

### Enemy
| Attribute    | Description |
|--------------|-------------|
| `speed`      | Movement speed in px/s. |
| `maxHealth`  | Hit points. Enemy dies at 0. |
| `gold`       | Gold awarded to player on kill. |
| `score`      | Score awarded to player on kill. |

Enemy types:
- **Basic** — balanced stats (speed 90, hp 100, gold 8, score 10)
- **Fast**  — low HP, high speed (speed 170, hp 60, gold 6, score 15)
- **Tank**  — high HP, slow (speed 45, hp 350, gold 20, score 25)
- **Boss**  — every 5th round placeholder (Tank stand-in, boss entity TBD)

### Tower
| Attribute      | Description |
|----------------|-------------|
| `damage`       | Damage per hit. |
| `attackSpeed`  | Attacks per second. |
| `range`        | Radius in pixels. |
| `cost`         | Gold cost to place. |

Tower types:
- **Basic** — pure DPS, no special effect (damage 30, speed 1.2/s, range 150, cost 75)
- **Slow**  — applies a speed debuff (TBD)
- **AOE**   — damages all enemies in radius (TBD)
- **Buff (damage/speed)** — passively boosts nearby towers (TBD)

---

## Current state (May 2026)
- [x] Vite + React + TypeScript scaffold
- [x] Tile-based map with S-path rendering (Canvas 2D)
- [x] GameMap owns pixel waypoints; Enemy receives them on construction
- [x] Enemy base class with health bar (green → yellow → red)
- [x] Enemy types: Basic, Fast, Tank
- [x] Wave system — WaveManager with data-driven per-round spawn config
- [x] Boss rounds every 5th wave (Tank placeholder)
- [x] Build / combat phase loop (SPACE to send wave)
- [x] Game state: round, score, gold, lives
- [x] Bottom HUD bar (round, lives, gold, score, phase hint)
- [x] Tower placement in build phase + right-click refund
- [x] Hover preview with range circle + green/red/orange tile tint
- [x] Tower selection buttons in HUD (greyed cost when unaffordable)
- [x] Basic tower — shoots furthest-in-range enemy, homing projectiles
- [x] Game-over overlay with final score
- [ ] Speciality towers (slow, AOE, buff-damage, buff-speed)
- [ ] Boss enemy entity (replace Tank placeholder on round 5)

## Known tech debt
None.

## What to build next
Suggested order:
1. Speciality towers (slow, AOE, buff-damage, buff-speed)
2. Boss enemy entity (replace Tank placeholder on round 5)
3. Start screen / restart button after game over

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
