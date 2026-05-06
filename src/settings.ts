export const TILE_SIZE = 40;
export const COLS = 20;
export const ROWS = 15;
export const GAME_WIDTH = COLS * TILE_SIZE;    // 800
export const GAME_HEIGHT = ROWS * TILE_SIZE;   // 600
export const UI_BAR_HEIGHT = 80;
export const WIN_WIDTH = GAME_WIDTH;           // 800
export const WIN_HEIGHT = GAME_HEIGHT + UI_BAR_HEIGHT; // 680

// Colors — UI / map
export const WHITE     = '#ffffff';
export const BLACK     = '#000000';
export const GRASS_A   = '#64a04b';  // rgb(100,160,75)
export const GRASS_B   = '#558c3c';  // rgb(85,140,60)
export const PATH_COL  = '#af915f';  // rgb(175,145,95)
export const DARK_GRAY = '#464646';  // rgb(70,70,70)
export const UI_BG     = '#1e1e1e';  // rgb(30,30,30)

// Colors — HUD
export const RED      = '#d73737';   // rgb(215,55,55)
export const GREEN_HP = '#32c846';   // rgb(50,200,70)
export const GOLD_COL = '#ffc828';   // rgb(255,200,40)

// Colors — enemies
export const ENEMY_BASIC = '#d73737'; // rgb(215,55,55)
export const ENEMY_FAST  = '#ffa500'; // rgb(255,165,0)
export const ENEMY_TANK  = '#5078c8'; // rgb(80,120,200)

// Colors — towers
export const TOWER_BASIC = '#3cb44b'; // rgb(60,180,75)

// Path waypoints (col, row) — winding S-shape across the grid
export const WAYPOINTS: [number, number][] = [
  [0,  3],
  [4,  3],
  [4, 11],
  [8, 11],
  [8,  5],
  [13,  5],
  [13, 11],
  [17, 11],
  [17,  3],
  [19,  3],
];
