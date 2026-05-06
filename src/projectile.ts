import { Enemy } from './enemy';

const PROJECTILE_SPEED = 300;
const PROJECTILE_SIZE  = 4;
const PROJECTILE_COLOR = '#ffe63c'; // rgb(255,230,60)

export class Projectile {
  x: number;
  y: number;
  target: Enemy;
  damage: number;
  alive: boolean;

  constructor(x: number, y: number, target: Enemy, damage: number) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.alive = true;
  }

  update(dt: number): void {
    if (!this.alive) return;
    if (!this.target.alive) { this.alive = false; return; }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = PROJECTILE_SPEED * dt;

    if (dist <= step) {
      this.target.takeDamage(this.damage);
      this.alive = false;
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;
    ctx.beginPath();
    ctx.arc(Math.round(this.x), Math.round(this.y), PROJECTILE_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = PROJECTILE_COLOR;
    ctx.fill();
  }
}
