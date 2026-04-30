Add a new enemy type to the tower defense game.

Arguments (optional): $ARGUMENTS
If arguments are provided, treat them as the enemy name and/or type hint (e.g. "fast", "tank", "swarm").
If no arguments are provided, ask the user what kind of enemy they want before proceeding.

Steps:
1. Read `tower_defense/CLAUDE.md` to confirm current enemy attribute spec (health, speed, gold, score).
2. Read `tower_defense/enemy.py` to understand the existing class structure and any base class patterns.
3. Read the wave config (e.g. `tower_defense/waves.py` or wherever wave/spawn data lives) if it exists.
4. Design the new enemy's stats in line with game balance — compare against existing types so the new one fills a distinct role (faster, tankier, cheaper to kill, etc.). State the stats and rationale before writing any code.
5. Implement the new enemy as a subclass (or data-driven variant) of the base Enemy class in `enemy.py`. Give it a distinct visual (color, size, or shape) so it's recognisable on screen.
6. If a wave config file exists, add the new enemy type to an appropriate round tier so it appears at a difficulty level that matches its stats.
7. Update the enemy type table in `tower_defense/CLAUDE.md` to include the new entry.

Constraints:
- Do not change existing enemy stats or class interfaces.
- Keep visual distinction simple — color and/or size change is enough for now.
- All new constants (colors, base stats) go in `settings.py`, not inline.
