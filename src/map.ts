import {
  TILE_SIZE, COLS, ROWS, WAYPOINTS,
  GRASS_A, GRASS_B, PATH_COL, BLACK, RED,
} from './settings';

function buildPathTiles(waypoints: [number, number][]): [number, number][] {
  const tiles: [number, number][] = [];
  const seen = new Set<string>();

  for (let i = 0; i < waypoints.length - 1; i++) {
    const [c1, r1] = waypoints[i];
    const [c2, r2] = waypoints[i + 1];

    if (c1 === c2) {
      const step = r2 > r1 ? 1 : -1;
      for (let r = r1; step > 0 ? r <= r2 : r >= r2; r += step) {
        const k = `${c1},${r}`;
        if (!seen.has(k)) { tiles.push([c1, r]); seen.add(k); }
      }
    } else {
      const step = c2 > c1 ? 1 : -1;
      for (let c = c1; step > 0 ? c <= c2 : c >= c2; c += step) {
        const k = `${c},${r1}`;
        if (!seen.has(k)) { tiles.push([c, r1]); seen.add(k); }
      }
    }
  }
  return tiles;
}

export class GameMap {
  pathTiles: [number, number][];
  pathSet: Set<string>;
  waypointPixels: [number, number][];
  occupied: Set<string>;

  constructor() {
    this.pathTiles = buildPathTiles(WAYPOINTS);
    this.pathSet = new Set(this.pathTiles.map(([c, r]) => `${c},${r}`));
    this.waypointPixels = this.pathTiles.map(([c, r]) => [
      c * TILE_SIZE + TILE_SIZE / 2,
      r * TILE_SIZE + TILE_SIZE / 2,
    ]);
    this.occupied = new Set();
  }

  isPath(col: number, row: number): boolean {
    return this.pathSet.has(`${col},${row}`);
  }

  isBuildable(col: number, row: number): boolean {
    return (
      col >= 0 && col < COLS &&
      row >= 0 && row < ROWS &&
      !this.pathSet.has(`${col},${row}`) &&
      !this.occupied.has(`${col},${row}`)
    );
  }

  pixelToTile(px: number, py: number): [number, number] {
    return [Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE)];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        if (this.pathSet.has(`${col},${row}`)) {
          ctx.fillStyle = PATH_COL;
        } else {
          ctx.fillStyle = (col + row) % 2 === 0 ? GRASS_A : GRASS_B;
        }
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = BLACK;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      }
    }

    // Entry (green) and exit (red) tile borders
    const [sc, sr] = WAYPOINTS[0];
    const [ec, er] = WAYPOINTS[WAYPOINTS.length - 1];

    ctx.strokeStyle = '#32d232';
    ctx.lineWidth = 3;
    ctx.strokeRect(sc * TILE_SIZE + 1.5, sr * TILE_SIZE + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);

    ctx.strokeStyle = RED;
    ctx.lineWidth = 3;
    ctx.strokeRect(ec * TILE_SIZE + 1.5, er * TILE_SIZE + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
  }
}
