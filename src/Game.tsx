import { useEffect, useRef } from 'react';
import { GameMap } from './map';
import { WaveManager } from './waves';
import { Basic as BasicTower, Tower } from './tower';
import {
  WIN_WIDTH, WIN_HEIGHT, GAME_HEIGHT, UI_BAR_HEIGHT,
  TILE_SIZE, BLACK, WHITE, UI_BG, GOLD_COL, RED, DARK_GRAY,
} from './settings';

const SCALE          = 0.75;
const STARTING_GOLD  = 225;
const STARTING_LIVES = 20;
const TOWER_TYPES: (typeof Tower)[] = [BasicTower];
const HUD_PAD    = 12;
const BTN_W      = 90;
const BTN_H      = 56;

// ── HUD helpers ───────────────────────────────────────────────────────────────

function towerBtnRect(index: number) {
  const total = TOWER_TYPES.length;
  const x = WIN_WIDTH / 2 - (total * (BTN_W + 8)) / 2 + index * (BTN_W + 8);
  const y = GAME_HEIGHT + (UI_BAR_HEIGHT - BTN_H) / 2;
  return { x, y, w: BTN_W, h: BTN_H };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  roundNum: number, score: number, gold: number, lives: number,
  phase: string, selectedCls: typeof Tower,
) {
  ctx.fillStyle = UI_BG;
  ctx.fillRect(0, GAME_HEIGHT, WIN_WIDTH, UI_BAR_HEIGHT);
  ctx.strokeStyle = DARK_GRAY;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, GAME_HEIGHT + 0.5);
  ctx.lineTo(WIN_WIDTH, GAME_HEIGHT + 0.5);
  ctx.stroke();

  // Left stats — two rows, two columns
  const STAT_COL_W = 130;
  ctx.font = '15px "Segoe UI", sans-serif';
  const row1: [string, string][] = [[`Round ${roundNum}`, WHITE], [`Score ${score.toLocaleString()}`, WHITE]];
  const row2: [string, string][] = [[`Lives ${lives}`, RED],       [`Gold  ${gold}`, GOLD_COL]];
  const row1Y = GAME_HEIGHT + 24;
  const row2Y = GAME_HEIGHT + 46;

  for (let i = 0; i < row1.length; i++) {
    ctx.fillStyle = row1[i][1];
    ctx.fillText(row1[i][0], HUD_PAD + i * STAT_COL_W, row1Y);
  }
  for (let i = 0; i < row2.length; i++) {
    ctx.fillStyle = row2[i][1];
    ctx.fillText(row2[i][0], HUD_PAD + i * STAT_COL_W, row2Y);
  }

  // Tower buttons (centre, build phase only)
  if (phase === 'build') {
    for (let i = 0; i < TOWER_TYPES.length; i++) {
      const cls = TOWER_TYPES[i];
      const btn = towerBtnRect(i);
      const selected = cls === selectedCls;

      ctx.fillStyle = selected ? '#465a46' : '#2d372d';
      roundedRect(ctx, btn.x, btn.y, btn.w, btn.h, 6);
      ctx.fill();

      ctx.strokeStyle = selected ? cls.COLOR : DARK_GRAY;
      ctx.lineWidth = 2;
      roundedRect(ctx, btn.x, btn.y, btn.w, btn.h, 6);
      ctx.stroke();

      ctx.font = '15px "Segoe UI", sans-serif';
      ctx.fillStyle = WHITE;
      const nameW = ctx.measureText(cls.LABEL).width;
      ctx.fillText(cls.LABEL, btn.x + (btn.w - nameW) / 2, btn.y + 22);

      const costText = `$${cls.COST}`;
      ctx.fillStyle = gold >= cls.COST ? GOLD_COL : '#a06464';
      const costW = ctx.measureText(costText).width;
      ctx.fillText(costText, btn.x + (btn.w - costW) / 2, btn.y + 42);
    }
  }

  // Right hint
  const hint = phase === 'build' ? 'SPACE — send wave' : 'Wave in progress...';
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillStyle = WHITE;
  const hintW = ctx.measureText(hint).width;
  ctx.fillText(hint, WIN_WIDTH - hintW - HUD_PAD, GAME_HEIGHT + UI_BAR_HEIGHT / 2 + 7);
}

function drawPlacementPreview(
  ctx: CanvasRenderingContext2D,
  gameMap: GameMap,
  selectedCls: typeof Tower,
  mouseX: number, mouseY: number,
  towerMap: Map<string, Tower>,
  newTowers: Set<Tower>,
) {
  if (mouseY >= GAME_HEIGHT) return;
  const [col, row] = gameMap.pixelToTile(mouseX, mouseY);
  const tileX = col * TILE_SIZE;
  const tileY = row * TILE_SIZE;

  const tower = towerMap.get(`${col},${row}`);
  const isRemovable = tower !== undefined && newTowers.has(tower);
  const buildable   = gameMap.isBuildable(col, row);

  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = isRemovable ? '#dc7828' : buildable ? '#50c850' : '#c83c3c';
  ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
  ctx.restore();

  if (buildable) {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    const r  = selectedCls.RANGE;

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = selectedCls.COLOR;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = selectedCls.COLOR;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

// ── React component ───────────────────────────────────────────────────────────

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;

    const gameMap  = new GameMap();
    const waveMgr  = new WaveManager(gameMap.waypointPixels);
    const towers: Tower[]          = [];
    const towerMap: Map<string, Tower> = new Map();
    const newTowers: Set<Tower>    = new Set();

    let roundNum    = 1;
    let score       = 0;
    let gold        = STARTING_GOLD;
    let lives       = STARTING_LIVES;
    let phase       = 'build';
    let selectedCls: typeof Tower = TOWER_TYPES[0];
    let mouseX = -1, mouseY = -1;
    let running  = true;
    let lastTime = 0;
    let rafId: number;

    // ── Event handlers ────────────────────────────────────────────────────────

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / SCALE;
      mouseY = (e.clientY - rect.top) / SCALE;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && phase === 'build') {
        e.preventDefault();
        phase = 'combat';
        newTowers.clear();
        waveMgr.startWave(roundNum);
      }
    }

    function onMouseDown(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / SCALE;
      const my = (e.clientY - rect.top) / SCALE;

      if (e.button === 0) {
        if (my >= GAME_HEIGHT && phase === 'build') {
          // Tower button click
          for (let i = 0; i < TOWER_TYPES.length; i++) {
            const btn = towerBtnRect(i);
            if (mx >= btn.x && mx <= btn.x + btn.w && my >= btn.y && my <= btn.y + btn.h) {
              selectedCls = TOWER_TYPES[i];
            }
          }
        } else if (my < GAME_HEIGHT && phase === 'build') {
          // Place tower
          const [col, row] = gameMap.pixelToTile(mx, my);
          if (gameMap.isBuildable(col, row) && gold >= selectedCls.COST) {
            const tower = new selectedCls(col, row);
            towers.push(tower);
            towerMap.set(`${col},${row}`, tower);
            newTowers.add(tower);
            gameMap.occupied.add(`${col},${row}`);
            gold -= selectedCls.COST;
          }
        }
      }

      if (e.button === 2 && my < GAME_HEIGHT && phase === 'build') {
        // Right-click — refund tower placed this build phase
        const [col, row] = gameMap.pixelToTile(mx, my);
        const tower = towerMap.get(`${col},${row}`);
        if (tower && newTowers.has(tower)) {
          towers.splice(towers.indexOf(tower), 1);
          towerMap.delete(`${col},${row}`);
          newTowers.delete(tower);
          gameMap.occupied.delete(`${col},${row}`);
          gold += tower.cost;
        }
      }
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', onKeyDown);

    // ── Game loop ─────────────────────────────────────────────────────────────

    function loop(timestamp: number) {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;

      if (phase === 'combat') {
        waveMgr.update(dt);
        gold  += waveMgr.goldEarned;
        score += waveMgr.scoreEarned;
        lives -= waveMgr.livesLost;

        if (lives <= 0) {
          lives   = 0;
          running = false;
        }

        for (const tower of towers) tower.update(dt, waveMgr.enemies);

        if (waveMgr.isComplete) {
          roundNum++;
          phase = 'build';
          for (const tower of towers) tower.clearProjectiles();
        }
      }

      // Draw
      ctx.fillStyle = BLACK;
      ctx.fillRect(0, 0, WIN_WIDTH, WIN_HEIGHT);

      gameMap.draw(ctx);

      for (const tower of towers) tower.draw(ctx);
      waveMgr.draw(ctx);

      if (phase === 'build') {
        drawPlacementPreview(ctx, gameMap, selectedCls, mouseX, mouseY, towerMap, newTowers);
      }

      drawHud(ctx, roundNum, score, gold, lives, phase, selectedCls);

      if (!running) {
        // Game-over overlay
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, WIN_WIDTH, WIN_HEIGHT);

        ctx.textAlign = 'center';
        ctx.fillStyle = RED;
        ctx.font = 'bold 52px "Segoe UI", sans-serif';
        ctx.fillText('GAME OVER', WIN_WIDTH / 2, WIN_HEIGHT / 2 - 20);

        ctx.fillStyle = WHITE;
        ctx.font = '26px "Segoe UI", sans-serif';
        ctx.fillText(`Final Score: ${score.toLocaleString()}`, WIN_WIDTH / 2, WIN_HEIGHT / 2 + 28);
        ctx.textAlign = 'left';
        return;
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(ts => { lastTime = ts; loop(ts); });

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('contextmenu', e => e.preventDefault());
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={WIN_WIDTH}
      height={WIN_HEIGHT}
      style={{ display: 'block', cursor: 'crosshair', width: WIN_WIDTH * SCALE, height: WIN_HEIGHT * SCALE }}
    />
  );
}
