import math
import pygame
from settings import TILE_SIZE, BLACK, TOWER_BASIC
from projectile import Projectile


class Tower:
    DAMAGE       = 30
    ATTACK_SPEED = 1.2    # attacks per second
    RANGE        = 150    # pixels — enemy spends ~3.3 s in range at Basic speed → 4 shots → 120 dmg
    COST         = 75
    COLOR        = TOWER_BASIC
    LABEL        = "Basic"

    def __init__(self, col: int, row: int):
        self.col  = col
        self.row  = row
        self.x    = col * TILE_SIZE + TILE_SIZE // 2
        self.y    = row * TILE_SIZE + TILE_SIZE // 2
        self._attack_timer: float  = 0.0
        self._projectiles: list    = []

    # ── Update ────────────────────────────────────────────────────────────────

    def update(self, dt: float, enemies: list) -> None:
        self._attack_timer -= dt
        if self._attack_timer <= 0:
            target = self._pick_target(enemies)
            if target:
                self._projectiles.append(
                    Projectile(self.x, self.y, target, self.DAMAGE)
                )
                self._attack_timer = 1.0 / self.ATTACK_SPEED

        for p in self._projectiles:
            p.update(dt)
        self._projectiles = [p for p in self._projectiles if p.alive]

    def clear_projectiles(self) -> None:
        self._projectiles.clear()

    def _pick_target(self, enemies: list):
        """Target the enemy furthest along the path that is within range."""
        in_range = [e for e in enemies
                    if e.alive and math.hypot(e.x - self.x, e.y - self.y) <= self.RANGE]
        return max(in_range, key=lambda e: e.wp_index) if in_range else None

    # ── Draw ──────────────────────────────────────────────────────────────────

    def draw(self, surface: pygame.Surface) -> None:
        half = TILE_SIZE // 2 - 4
        rect = pygame.Rect(self.x - half, self.y - half, half * 2, half * 2)
        pygame.draw.rect(surface, self.COLOR, rect, border_radius=4)
        pygame.draw.rect(surface, BLACK, rect, 2, border_radius=4)

        for p in self._projectiles:
            p.draw(surface)

class Basic(Tower):
    pass   # inherits all Tower defaults
