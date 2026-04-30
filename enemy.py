import math
import pygame
from settings import BLACK, DARK_GRAY, RED, GREEN_HP, ENEMY_BASIC, ENEMY_FAST, ENEMY_TANK


class Enemy:
    SPEED      = 0
    MAX_HEALTH = 0
    SIZE       = 12
    COLOR      = ENEMY_BASIC
    GOLD       = 0
    SCORE      = 0

    def __init__(self, pixel_waypoints: list[tuple[int, int]]):
        self.waypoints   = pixel_waypoints
        self.wp_index    = 0
        self.x           = float(pixel_waypoints[0][0])
        self.y           = float(pixel_waypoints[0][1])
        self.health      = float(self.MAX_HEALTH)
        self.alive       = True
        self.reached_end = False

    @property
    def gold(self) -> int:
        return self.GOLD

    @property
    def score(self) -> int:
        return self.SCORE

    def take_damage(self, amount: float) -> None:
        self.health -= amount
        if self.health <= 0:
            self.alive = False

    def update(self, dt: float) -> None:
        if not self.alive or self.reached_end:
            return

        remaining = self.SPEED * dt

        while remaining > 0 and self.wp_index < len(self.waypoints) - 1:
            tx, ty = self.waypoints[self.wp_index + 1]
            dx, dy = tx - self.x, ty - self.y
            dist   = math.hypot(dx, dy)

            if dist <= remaining:
                self.x, self.y = float(tx), float(ty)
                self.wp_index += 1
                remaining -= dist
            else:
                self.x += dx / dist * remaining
                self.y += dy / dist * remaining
                remaining = 0

        if self.wp_index >= len(self.waypoints) - 1:
            self.reached_end = True
            self.alive       = False

    def draw(self, surface: pygame.Surface) -> None:
        if not self.alive:
            return
        ix, iy = int(self.x), int(self.y)

        pygame.draw.circle(surface, self.COLOR, (ix, iy), self.SIZE)
        pygame.draw.circle(surface, BLACK,      (ix, iy), self.SIZE, 2)

        bw = self.SIZE * 2
        bh = 4
        bx = ix - self.SIZE
        by = iy - self.SIZE - 8
        pygame.draw.rect(surface, DARK_GRAY, (bx, by, bw, bh))
        ratio     = self.health / self.MAX_HEALTH
        bar_color = GREEN_HP if ratio > 0.5 else (215, 175, 45) if ratio > 0.25 else RED
        pygame.draw.rect(surface, bar_color, (bx, by, int(bw * ratio), bh))


class Basic(Enemy):
    SPEED      = 90
    MAX_HEALTH = 100
    SIZE       = 12
    COLOR      = ENEMY_BASIC
    GOLD       = 8
    SCORE      = 10


class Fast(Enemy):
    SPEED      = 170
    MAX_HEALTH = 60
    SIZE       = 9
    COLOR      = ENEMY_FAST
    GOLD       = 6
    SCORE      = 15


class Tank(Enemy):
    SPEED      = 45
    MAX_HEALTH = 350
    SIZE       = 16
    COLOR      = ENEMY_TANK
    GOLD       = 20
    SCORE      = 25
