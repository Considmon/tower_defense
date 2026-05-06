import { TILE_SIZE, TOWER_BASIC } from './settings';
import { Enemy } from './enemy';
import { Projectile } from './projectile';

export class Tower {
  static readonly DAMAGE       = 30;
  static readonly ATTACK_SPEED = 1.2;  // attacks per second
  static readonly RANGE        = 150;  // pixels
  static readonly COST         = 75;
  static readonly COLOR        = TOWER_BASIC;
  static readonly LABEL        = 'Basic';

  readonly damage: number;
  readonly attackSpeed: number;
  readonly range: number;
  readonly cost: number;
  readonly color: string;
  readonly label: string;

  col: number;
  row: number;
  x: number;
  y: number;
  private attackTimer = 0;
  private projectiles: Projectile[] = [];

  constructor(col: number, row: number) {
    const cls = this.constructor as typeof Tower;
    this.damage      = cls.DAMAGE;
    this.attackSpeed = cls.ATTACK_SPEED;
    this.range       = cls.RANGE;
    this.cost        = cls.COST;
    this.color       = cls.COLOR;
    this.label       = cls.LABEL;

    this.col = col;
    this.row = row;
    this.x   = col * TILE_SIZE + TILE_SIZE / 2;
    this.y   = row * TILE_SIZE + TILE_SIZE / 2;
  }

  update(dt: number, enemies: Enemy[]): void {
    this.attackTimer -= dt;
    if (this.attackTimer <= 0) {
      const target = this.pickTarget(enemies);
      if (target) {
        this.projectiles.push(new Projectile(this.x, this.y, target, this.damage));
        this.attackTimer = 1.0 / this.attackSpeed;
      }
    }
    for (const p of this.projectiles) p.update(dt);
    this.projectiles = this.projectiles.filter(p => p.alive);
  }

  clearProjectiles(): void {
    this.projectiles = [];
  }

  private pickTarget(enemies: Enemy[]): Enemy | null {
    const inRange = enemies.filter(
      e => e.alive && Math.hypot(e.x - this.x, e.y - this.y) <= this.range,
    );
    if (inRange.length === 0) return null;
    return inRange.reduce((best, e) => (e.wpIndex > best.wpIndex ? e : best));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const half = TILE_SIZE / 2 - 4;
    const x = this.x - half;
    const y = this.y - half;
    const size = half * 2;
    const r = 4;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + size - r, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + r);
    ctx.lineTo(x + size, y + size - r);
    ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
    ctx.lineTo(x + r, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (const p of this.projectiles) p.draw(ctx);
  }
}

export class Basic extends Tower {}
