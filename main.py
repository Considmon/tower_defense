import pygame
from settings import (
    FPS, WIN_WIDTH, WIN_HEIGHT, GAME_HEIGHT, UI_BAR_HEIGHT,
    TILE_SIZE, BLACK, WHITE, UI_BG, GOLD_COL, RED, DARK_GRAY,
)
from map import Map
from waves import WaveManager
from tower import Basic as BasicTower

# ── Constants ─────────────────────────────────────────────────────────────────
STARTING_GOLD  = 225
STARTING_LIVES = 20
TOWER_TYPES    = [BasicTower]   # extend as new tower types are added

# HUD layout
HUD_PAD        = 12
TOWER_BTN_W    = 90
TOWER_BTN_H    = 56


# ── HUD helpers ───────────────────────────────────────────────────────────────

def _tower_btn_rect(index: int) -> pygame.Rect:
    x = WIN_WIDTH // 2 - (len(TOWER_TYPES) * (TOWER_BTN_W + 8)) // 2 + index * (TOWER_BTN_W + 8)
    y = GAME_HEIGHT + (UI_BAR_HEIGHT - TOWER_BTN_H) // 2
    return pygame.Rect(x, y, TOWER_BTN_W, TOWER_BTN_H)


def draw_hud(surface: pygame.Surface, font_lg, font_sm,
             round_num: int, score: int, gold: int, lives: int,
             phase: str, selected_cls) -> None:

    pygame.draw.rect(surface, UI_BG, (0, GAME_HEIGHT, WIN_WIDTH, UI_BAR_HEIGHT))
    pygame.draw.line(surface, DARK_GRAY, (0, GAME_HEIGHT), (WIN_WIDTH, GAME_HEIGHT), 1)

    # ── Left stats (2 rows, fixed columns so score never overflows) ───────────
    STAT_COL_W = 130
    row1 = [(f"Round {round_num}", WHITE),  (f"Score {score:,}", WHITE)]
    row2 = [(f"Lives {lives}",     RED),    (f"Gold  {gold}",    GOLD_COL)]
    row1_y = GAME_HEIGHT + 10
    row2_y = GAME_HEIGHT + 10 + font_sm.get_height() + 4
    for i, (text, color) in enumerate(row1):
        surface.blit(font_sm.render(text, True, color), (HUD_PAD + i * STAT_COL_W, row1_y))
    for i, (text, color) in enumerate(row2):
        surface.blit(font_sm.render(text, True, color), (HUD_PAD + i * STAT_COL_W, row2_y))

    # ── Tower buttons (centre) ────────────────────────────────────────────────
    if phase == "build":
        for i, cls in enumerate(TOWER_TYPES):
            rect     = _tower_btn_rect(i)
            selected = cls is selected_cls
            bg_color = (70, 90, 70) if selected else (45, 55, 45)
            border   = cls.COLOR if selected else DARK_GRAY

            pygame.draw.rect(surface, bg_color, rect, border_radius=6)
            pygame.draw.rect(surface, border,   rect, 2, border_radius=6)

            name_surf = font_sm.render(cls.LABEL, True, WHITE)
            cost_surf = font_sm.render(f"${cls.COST}", True, GOLD_COL)

            can_afford = gold >= cls.COST
            if not can_afford:
                cost_surf = font_sm.render(f"${cls.COST}", True, (160, 100, 100))

            surface.blit(name_surf, (rect.centerx - name_surf.get_width() // 2,
                                     rect.y + 8))
            surface.blit(cost_surf, (rect.centerx - cost_surf.get_width() // 2,
                                     rect.y + 8 + name_surf.get_height() + 4))

    # ── Right hint ────────────────────────────────────────────────────────────
    hint = "SPACE — send wave" if phase == "build" else "Wave in progress..."
    hint_surf = font_lg.render(hint, True, WHITE)
    surface.blit(hint_surf, (WIN_WIDTH - hint_surf.get_width() - HUD_PAD,
                              GAME_HEIGHT + (UI_BAR_HEIGHT - hint_surf.get_height()) // 2))


# ── Placement preview ─────────────────────────────────────────────────────────

def draw_placement_preview(surface: pygame.Surface, game_map: Map,
                           selected_cls, mouse_pos: tuple,
                           tower_map: dict, new_towers: set) -> None:
    mx, my = mouse_pos
    if my >= GAME_HEIGHT:
        return
    col, row = game_map.pixel_to_tile(mx, my)

    tile_rect = pygame.Rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    overlay   = pygame.Surface((TILE_SIZE, TILE_SIZE), pygame.SRCALPHA)

    tower_here    = tower_map.get((col, row))
    is_removable  = tower_here is not None and tower_here in new_towers
    buildable     = game_map.is_buildable(col, row)

    if is_removable:
        overlay.fill((220, 120, 40, 100))   # orange — right-click to refund
    elif buildable:
        overlay.fill((80, 200, 80, 90))     # green — can place
    else:
        overlay.fill((200, 60, 60, 90))     # red — blocked

    surface.blit(overlay, tile_rect.topleft)

    if buildable:
        cx = col * TILE_SIZE + TILE_SIZE // 2
        cy = row * TILE_SIZE + TILE_SIZE // 2
        r  = selected_cls.RANGE
        range_surf = pygame.Surface((r * 2, r * 2), pygame.SRCALPHA)
        pygame.draw.circle(range_surf, (*selected_cls.COLOR, 45), (r, r), r)
        pygame.draw.circle(range_surf, (*selected_cls.COLOR, 120), (r, r), r, 1)
        surface.blit(range_surf, (cx - r, cy - r))


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    pygame.init()
    screen   = pygame.display.set_mode((WIN_WIDTH, WIN_HEIGHT))
    pygame.display.set_caption("Tower Defense")
    clock    = pygame.time.Clock()
    font_lg  = pygame.font.SysFont("segoeui", 18)
    font_sm  = pygame.font.SysFont("segoeui", 15)

    game_map                       = Map()
    wave_mgr                       = WaveManager(game_map.waypoint_pixels)
    towers:     list               = []
    tower_map:  dict               = {}   # (col, row) -> Tower for fast lookup
    new_towers: set                = set()  # towers placed this build phase (refundable)

    # ── Game state ────────────────────────────────────────────────────────────
    round_num    = 1
    score        = 0
    gold         = STARTING_GOLD
    lives        = STARTING_LIVES
    phase        = "build"
    selected_cls = TOWER_TYPES[0]

    running = True
    while running:
        dt = min(clock.tick(FPS) / 1000.0, 0.05)  # cap at 50 ms to survive focus loss
        mouse_pos = pygame.mouse.get_pos()

        # ── Events ────────────────────────────────────────────────────────────
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                if event.key == pygame.K_SPACE and phase == "build":
                    phase = "combat"
                    new_towers.clear()   # lock in placed towers
                    wave_mgr.start_wave(round_num)

            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                mx, my = event.pos

                # Tower button click (HUD)
                if my >= GAME_HEIGHT and phase == "build":
                    for i, cls in enumerate(TOWER_TYPES):
                        if _tower_btn_rect(i).collidepoint(mx, my):
                            selected_cls = cls

                # Tile click — place tower
                elif my < GAME_HEIGHT and phase == "build":
                    col, row = game_map.pixel_to_tile(mx, my)
                    if game_map.is_buildable(col, row) and gold >= selected_cls.COST:
                        tower = selected_cls(col, row)
                        towers.append(tower)
                        tower_map[(col, row)] = tower
                        new_towers.add(tower)
                        game_map.occupied.add((col, row))
                        gold -= selected_cls.COST

            # Right-click — refund tower placed this build phase
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 3:
                mx, my = event.pos
                if my < GAME_HEIGHT and phase == "build":
                    col, row = game_map.pixel_to_tile(mx, my)
                    tower    = tower_map.get((col, row))
                    if tower is not None and tower in new_towers:
                        towers.remove(tower)
                        del tower_map[(col, row)]
                        new_towers.discard(tower)
                        game_map.occupied.discard((col, row))
                        gold += tower.COST

        # ── Update ────────────────────────────────────────────────────────────
        if phase == "combat":
            wave_mgr.update(dt)
            gold  += wave_mgr.gold_earned
            score += wave_mgr.score_earned
            lives -= wave_mgr.lives_lost

            if lives <= 0:
                lives   = 0
                running = False   # game-over screen TBD

            for tower in towers:
                tower.update(dt, wave_mgr.enemies)

            if wave_mgr.is_complete:
                round_num += 1
                phase      = "build"
                for tower in towers:
                    tower.clear_projectiles()

        # ── Draw ──────────────────────────────────────────────────────────────
        screen.fill(BLACK)
        game_map.draw(screen)

        for tower in towers:
            tower.draw(screen)

        wave_mgr.draw(screen)

        if phase == "build":
            draw_placement_preview(screen, game_map, selected_cls, mouse_pos,
                                   tower_map, new_towers)

        draw_hud(screen, font_lg, font_sm, round_num, score, gold, lives,
                 phase, selected_cls)

        pygame.display.flip()

    pygame.quit()


if __name__ == "__main__":
    main()
