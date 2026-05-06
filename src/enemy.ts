import { DARK_GRAY, GREEN_HP, RED, ENEMY_BASIC, ENEMY_FAST, ENEMY_TANK } from './settings';

export class Enemy {
  static readonly SPEED: number = 0;
  static readonly MAX_HEALTH: number = 0;
  static readonly SIZE: number = 12;
  static readonly COLOR: string = ENEMY_BASIC;
  static readonly GOLD: number = 0;
  static readonly SCORE: number = 0;

  readonly speed: number;
  readonly maxHealth: number;
  readonly size: number;
  readonly color: string;
  readonly gold: number;
  readonly score: number;

  waypoints: [number, number][];
  wpIndex: number;
  x: number;
  y: number;
  health: number;
  alive: boolean;
  reachedEnd: boolean;

  constructor(pixelWaypoints: [number, number][]) {
    const cls = this.constructor as typeof Enemy;
    this.speed = cls.SPEED;
    this.maxHealth = cls.MAX_HEALTH;
    this.size = cls.SIZE;
    this.color = cls.COLOR;
    this.gold = cls.GOLD;
    this.score = cls.SCORE;

    this.waypoints = pixelWaypoints;
    this.wpIndex = 0;
    this.x = pixelWaypoints[0][0];
    this.y = pixelWaypoints[0][1];
    this.health = this.maxHealth;
    this.alive = true;
    this.reachedEnd = false;
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) this.alive = false;
  }

  update(dt: number): void {
    if (!this.alive || this.reachedEnd) return;

    let remaining = this.speed * dt;

    while (remaining > 0 && this.wpIndex < this.waypoints.length - 1) {
      const [tx, ty] = this.waypoints[this.wpIndex + 1];
      const dx = tx - this.x;
      const dy = ty - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= remaining) {
        this.x = tx;
        this.y = ty;
        this.wpIndex++;
        remaining -= dist;
      } else {
        this.x += (dx / dist) * remaining;
        this.y += (dy / dist) * remaining;
        remaining = 0;
      }
    }

    if (this.wpIndex >= this.waypoints.length - 1) {
      this.reachedEnd = true;
      this.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    const ix = Math.round(this.x);
    const iy = Math.round(this.y);

    ctx.beginPath();
    ctx.arc(ix, iy, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Health bar
    const bw = this.size * 2;
    const bh = 4;
    const bx = ix - this.size;
    const by = iy - this.size - 8;

    ctx.fillStyle = DARK_GRAY;
    ctx.fillRect(bx, by, bw, bh);

    const ratio = this.health / this.maxHealth;
    ctx.fillStyle = ratio > 0.5 ? GREEN_HP : ratio > 0.25 ? '#d7af2d' : RED;
    ctx.fillRect(bx, by, Math.round(bw * ratio), bh);
  }
}

export class Basic extends Enemy {
  static readonly SPEED = 90;
  static readonly MAX_HEALTH = 100;
  static readonly SIZE = 12;
  static readonly COLOR = ENEMY_BASIC;
  static readonly GOLD = 8;
  static readonly SCORE = 10;
}

export class Fast extends Enemy {
  static readonly SPEED = 170;
  static readonly MAX_HEALTH = 60;
  static readonly SIZE = 9;
  static readonly COLOR = ENEMY_FAST;
  static readonly GOLD = 6;
  static readonly SCORE = 15;
}

export class Tank extends Enemy {
  static readonly SPEED = 45;
  static readonly MAX_HEALTH = 350;
  static readonly SIZE = 16;
  static readonly COLOR = ENEMY_TANK;
  static readonly GOLD = 20;
  static readonly SCORE = 25;
}
