import { Basic, Fast, Tank, Enemy } from './enemy';

const SPAWN_INTERVAL = 0.6; // seconds between each enemy spawn

type EnemyClass = new (waypoints: [number, number][]) => Enemy;

function buildSpawnQueue(roundNum: number): EnemyClass[] {
  if (roundNum % 5 === 0) {
    const tier = Math.floor(roundNum / 5);
    return [
      ...Array<EnemyClass>(tier * 4).fill(Basic),
      ...Array<EnemyClass>(tier * 4).fill(Fast),
      ...Array<EnemyClass>(tier * 2).fill(Tank),
    ];
  }
  const basic = 5 + roundNum * 2;
  const fast  = Math.max(0, (roundNum - 3) * 2);
  const tank  = Math.max(0, roundNum - 8);
  return [
    ...Array<EnemyClass>(basic).fill(Basic),
    ...Array<EnemyClass>(fast).fill(Fast),
    ...Array<EnemyClass>(tank).fill(Tank),
  ];
}

export class WaveManager {
  pixelWaypoints: [number, number][];
  enemies: Enemy[];
  private spawnQueue: EnemyClass[];
  private spawnTimer: number;
  private started: boolean;
  waveActive: boolean;

  goldEarned  = 0;
  livesLost   = 0;
  scoreEarned = 0;

  constructor(pixelWaypoints: [number, number][]) {
    this.pixelWaypoints = pixelWaypoints;
    this.enemies    = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.started    = false;
    this.waveActive = false;
  }

  startWave(roundNum: number): void {
    this.spawnQueue = buildSpawnQueue(roundNum);
    this.spawnTimer = 0;
    this.started    = true;
    this.waveActive = true;
    this.enemies    = [];
  }

  get isComplete(): boolean {
    return this.started && !this.waveActive && this.enemies.length === 0;
  }

  update(dt: number): void {
    this.goldEarned  = 0;
    this.livesLost   = 0;
    this.scoreEarned = 0;

    if (!this.waveActive) return;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
      const EnemyCls = this.spawnQueue.shift()!;
      this.enemies.push(new EnemyCls(this.pixelWaypoints));
      this.spawnTimer = SPAWN_INTERVAL;
    }

    const alive: Enemy[] = [];
    for (const enemy of this.enemies) {
      enemy.update(dt);
      if (enemy.reachedEnd) {
        this.livesLost++;
      } else if (!enemy.alive) {
        this.goldEarned  += enemy.gold;
        this.scoreEarned += enemy.score;
      } else {
        alive.push(enemy);
      }
    }
    this.enemies = alive;

    if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveActive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const enemy of this.enemies) enemy.draw(ctx);
  }
}
