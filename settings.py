TILE_SIZE    = 40
COLS         = 20
ROWS         = 15
GAME_WIDTH   = COLS * TILE_SIZE   # 800
GAME_HEIGHT  = ROWS * TILE_SIZE   # 600
UI_BAR_HEIGHT = 80
WIN_WIDTH    = GAME_WIDTH         # 800
WIN_HEIGHT   = GAME_HEIGHT + UI_BAR_HEIGHT  # 680
FPS          = 60

# Colors — UI / map
WHITE      = (255, 255, 255)
BLACK      = (0,   0,   0  )
GRASS_A    = (100, 160,  75)
GRASS_B    = ( 85, 140,  60)
PATH_COL   = (175, 145,  95)
DARK_GRAY  = ( 70,  70,  70)
UI_BG      = ( 30,  30,  30)

# Colors — HUD
RED        = (215,  55,  55)
GREEN_HP   = ( 50, 200,  70)
GOLD_COL   = (255, 200,  40)

# Colors — enemies
ENEMY_BASIC  = (215,  55,  55)   # red
ENEMY_FAST   = (255, 165,   0)   # orange
ENEMY_TANK   = ( 80, 120, 200)   # blue

# Colors — towers
TOWER_BASIC  = ( 60, 180,  75)   # green

# Path waypoints (col, row) — winding S-shape across the grid
WAYPOINTS = [
    ( 0,  3),
    ( 4,  3),
    ( 4, 11),
    ( 8, 11),
    ( 8,  5),
    (13,  5),
    (13, 11),
    (17, 11),
    (17,  3),
    (19,  3),
]
