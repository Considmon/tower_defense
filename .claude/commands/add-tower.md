Add a new tower type to the tower defense game.

Arguments (optional): $ARGUMENTS
If arguments are provided, treat them as the tower name and/or speciality hint (e.g. "slow", "aoe", "buff-damage").
If no arguments are provided, ask the user what kind of tower they want before proceeding.

Steps:
1. Read `tower_defense/CLAUDE.md` to confirm the current tower attribute spec (damage, attack_speed, range, cost, speciality) and the list of planned tower types.
2. Read `tower_defense/tower.py` (or wherever towers are implemented) to understand the existing class structure, targeting logic, and how towers hook into the game loop.
3. Design the new tower's stats — compare cost/dps/utility against existing towers so the new one has a clear niche. State the stats and rationale before writing any code.
4. Implement the tower as a subclass of the base Tower class. Include:
   - `damage`, `attack_speed`, `range`, `cost` as class-level attributes
   - `speciality` logic (slow debuff, AOE splash, buff aura, etc.) in the `update` or `on_hit` method
   - A distinct visual so the player can tell towers apart at a glance
5. Register the new tower in whatever tower-selection UI or build menu exists (e.g. a sidebar, hotkey, or click-to-place system).
6. Update the tower type table in `tower_defense/CLAUDE.md` to include the new entry.

Constraints:
- Do not change existing tower stats or class interfaces.
- Buff towers affect nearby towers passively — do not give them projectiles.
- All new constants (colors, base stats, range values) go in `settings.py`, not inline.
- Cost must be balanced: a tower's total value should be recoverable within a reasonable number of kills.
