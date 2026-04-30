# Tower Defense — Project Spec

## Stack
- **Python 3.11+** with **pygame**
- Single-file modules; no frameworks, no external deps beyond pygame
- Run: `python main.py` from the `tower_defense/` directory

## Architecture

```
tower_defense/
  settings.py    — all constants (grid, colors, waypoints). No logic.
  map.py         — Map class: tile layout, path, buildability, rendering
  enemy.py       — Enemy base class + Basic, Fast, Tank subclasses
  waves.py       — WaveManager (spawning, tracking) + per-round spawn config
  tower.py       — Tower base class + Basic subclass; owns projectile list
  projectile.py  — Projectile class; home-seeks target, calls take_damage on hit
  main.py        — game loop, event handling, HUD, top-level orchestration
```

### Key concepts
- **Grid**: 20 cols × 15 rows, each tile 40×40 px. Game area is 800×600.
- **Window**: 800×680 — the extra 80px at the bottom is the UI bar (gold, lives, score, round, tower buttons, Ready button). `GAME_HEIGHT` is the boundary between the game area and the UI bar; never render game entities below it.
- **Waypoints**: defined in `settings.WAYPOINTS` as `(col, row)` pairs forming an S-shaped path from left to right.
- **Pixel waypoints**: dense list of pixel-center positions along the path, owned by `Map.waypoint_pixels`, passed into `Enemy` on creation.
- **Map.occupied**: set of `(col, row)` tiles blocked by towers — update this when placing/removing towers.

## Conventions
- All colors and grid constants live in `settings.py`. Never hardcode them elsewhere.
- New game entities (towers, projectiles, etc.) each get their own module, following the Enemy pattern: a class with `update(dt)` and `draw(surface)` methods.
- `dt` is always in **seconds** (result of `clock.tick(FPS) / 1000.0`).
- Coordinates: tile space is `(col, row)`, pixel space is `(x, y)`. Keep them separate and convert explicitly.
- Use `Map.is_buildable(col, row)` before placing any tower.

---

## Game Design

### Game loop — two phases per round
1. **Build phase** — player places towers using gold. A "Ready" button ends the phase and spawns the wave.
2. **Combat phase** — enemy wave walks the path. Player cannot place towers. Phase ends when all enemies are dead or have leaked.

### Economy
- Player starts with a fixed amount of gold.
- Placing a tower costs gold (varies by tower type).
- Killing an enemy awards its `gold` value.
- Gold carries over between rounds.

### Progression
- Each round spawns more enemies and introduces tougher/faster variants.
- Difficulty scales gradually — early rounds are easy, later rounds mix enemy types.
- Every **5th round is a Boss round** — one (or more) boss enemies with high HP and a bonus score/gold reward.

### Scoring
- Each killed enemy awards its `score` value.
- Bosses award significantly more score than regular enemies.
- Track a running total score and current round number — display both in the HUD.

---

## Entity Specs

### Enemy
| Attribute | Description |
|-----------|-------------|
| `health`  | Hit points. Enemy dies at 0. |
| `speed`   | Movement speed in px/s. |
| `gold`    | Gold awarded to player on kill. |
| `score`   | Score awarded to player on kill. |

Enemy types to implement (start simple, add variety with rounds):
- **Basic** — balanced stats, cheap to kill
- **Fast** — low HP, high speed
- **Tank** — high HP, slow speed, more gold
- **Boss** (every 5th round) — very high HP, special mechanics TBD, high gold + score

### Tower
| Attribute      | Description |
|----------------|-------------|
| `damage`       | Damage per hit. |
| `attack_speed` | Attacks per second. |
| `range`        | Radius in pixels. |
| `cost`         | Gold cost to place. |
| `speciality`   | See below. |

Tower types:
- **Basic** — pure DPS, no special effect
- **Slow** — applies a speed debuff to hit enemies
- **AOE** — damages all enemies within a radius on each attack
- **Buff (damage)** — passively boosts `damage` of nearby towers
- **Buff (speed)** — passively boosts `attack_speed` of nearby towers

### Boss
- Subclass or variant of Enemy with much higher `health`, higher `gold` and `score`.
- Appears as the only enemy (or with small escorts) on every 5th round.
- Special mechanics deferred — keep boss data structure flexible.

---

## State to track in main
- `round` — current round number (starts at 1)
- `score` — cumulative score
- `gold` — current gold
- `lives` — player HP; decremented when an enemy reaches the exit. Game over at 0.
- `phase` — `"build"` or `"combat"`

---

## Current state (April 2026)
- [x] Tile-based map with S-path rendering
- [x] Map owns pixel waypoints; Enemy receives them on construction
- [x] Enemy base class with health bar (green → yellow → red)
- [x] Enemy types: Basic, Fast, Tank (distinct stats, colors, sizes)
- [x] Wave system — WaveManager with data-driven per-round spawn config
- [x] Boss rounds every 5th wave (heavy mix; boss entity TBD)
- [x] Build / combat phase loop (SPACE to send wave)
- [x] Game state: round, score, gold, lives
- [x] Bottom HUD bar (round, lives, gold, score, phase hint)
- [x] Tower placement in build phase (click tile, deduct gold)
- [x] Hover preview with range circle + green/red tile tint
- [x] Tower selection buttons in HUD (greyed cost when unaffordable)
- [x] Basic tower — shoots furthest-in-range enemy, homing projectiles
- [ ] Speciality towers (slow, AOE, buff-damage, buff-speed)
- [ ] Boss enemy entity (currently uses Tank as placeholder)
- [ ] Game-over screen

## Known tech debt
None.

## What to build next
Suggested order:
1. Speciality towers (slow, AOE, buff-damage, buff-speed)
2. Boss enemy entity (replace Tank placeholder on round 5)
3. Game-over screen
