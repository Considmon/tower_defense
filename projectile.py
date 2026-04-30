import math
import pygame

PROJECTILE_SPEED = 300   # pixels per second
PROJECTILE_SIZE  = 4
PROJECTILE_COLOR = (255, 230, 60)


class Projectile:
    def __init__(self, x: float, y: float, target, damage: float):
        self.x      = x
        self.y      = y
        self.target = target
        self.damage = damage
        self.alive  = True

    def update(self, dt: float) -> None:
        if not self.alive:
            return
        if not self.target.alive:
            self.alive = False
            return

        dx   = self.target.x - self.x
        dy   = self.target.y - self.y
        dist = math.hypot(dx, dy)
        step = PROJECTILE_SPEED * dt

        if dist <= step:
            self.target.take_damage(self.damage)
            self.alive = False
        else:
            self.x += dx / dist * step
            self.y += dy / dist * step

    def draw(self, surface: pygame.Surface) -> None:
        if self.alive:
            pygame.draw.circle(surface, PROJECTILE_COLOR,
                               (int(self.x), int(self.y)), PROJECTILE_SIZE)
