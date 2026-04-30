import pygame
from settings import (
    TILE_SIZE, COLS, ROWS, WAYPOINTS,
    GRASS_A, GRASS_B, PATH_COL, BLACK, RED,
)


def _build_path_tiles(waypoints):
    """Return an ordered list of (col, row) tiles that make up the path."""
    tiles = []
    for i in range(len(waypoints) - 1):
        c1, r1 = waypoints[i]
        c2, r2 = waypoints[i + 1]
        if c1 == c2:                          # vertical segment
            step = 1 if r2 > r1 else -1
            for r in range(r1, r2 + step, step):
                if (c1, r) not in tiles:
                    tiles.append((c1, r))
        else:                                  # horizontal segment
            step = 1 if c2 > c1 else -1
            for c in range(c1, c2 + step, step):
                if (c, r1) not in tiles:
                    tiles.append((c, r1))
    return tiles


class Map:
    def __init__(self):
        self.path_tiles = _build_path_tiles(WAYPOINTS)
        self.path_set   = set(self.path_tiles)
        # Pixel-center positions along the path (used by enemies)
        self.waypoint_pixels = [
            (c * TILE_SIZE + TILE_SIZE // 2, r * TILE_SIZE + TILE_SIZE // 2)
            for (c, r) in self.path_tiles
        ]
        self.occupied: set[tuple[int, int]] = set()   # tiles with towers

    # ── Queries ───────────────────────────────────────────────────────────────
    def is_path(self, col: int, row: int) -> bool:
        return (col, row) in self.path_set

    def is_buildable(self, col: int, row: int) -> bool:
        return (
            0 <= col < COLS
            and 0 <= row < ROWS
            and (col, row) not in self.path_set
            and (col, row) not in self.occupied
        )

    def pixel_to_tile(self, px: int, py: int) -> tuple[int, int]:
        return px // TILE_SIZE, py // TILE_SIZE

    # ── Rendering ─────────────────────────────────────────────────────────────
    def draw(self, surface: pygame.Surface) -> None:
        for row in range(ROWS):
            for col in range(COLS):
                rect = pygame.Rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
                if (col, row) in self.path_set:
                    pygame.draw.rect(surface, PATH_COL, rect)
                else:
                    color = GRASS_A if (col + row) % 2 == 0 else GRASS_B
                    pygame.draw.rect(surface, color, rect)
                # Grid line
                pygame.draw.rect(surface, BLACK, rect, 1)

        # Highlight entry (green border) and exit (red border)
        sc, sr = WAYPOINTS[0]
        ec, er = WAYPOINTS[-1]
        pygame.draw.rect(surface, (50, 210, 50),
                         (sc * TILE_SIZE, sr * TILE_SIZE, TILE_SIZE, TILE_SIZE), 3)
        pygame.draw.rect(surface, RED,
                         (ec * TILE_SIZE, er * TILE_SIZE, TILE_SIZE, TILE_SIZE), 3)
