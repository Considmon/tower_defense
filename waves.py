from enemy import Basic, Fast, Tank

SPAWN_INTERVAL = 0.6  # seconds between each enemy spawn


def _build_spawn_queue(round_num: int) -> list:
    """Return an ordered list of enemy classes for the given round."""
    if round_num % 5 == 0:
        # Boss round — heavy mix; boss entity TBD, using tanks as stand-in
        tier = round_num // 5
        return [Basic] * (tier * 4) + [Fast] * (tier * 4) + [Tank] * (tier * 2)

    basic = 5 + round_num * 2
    fast  = max(0, (round_num - 3) * 2)
    tank  = max(0, round_num - 8)
    return [Basic] * basic + [Fast] * fast + [Tank] * tank


class WaveManager:
    def __init__(self, pixel_waypoints: list[tuple[int, int]]):
        self.pixel_waypoints = pixel_waypoints
        self.enemies: list   = []
        self._spawn_queue: list = []
        self._spawn_timer: float = 0.0
        self._started: bool  = False
        self.wave_active: bool = False

        # Accumulated each update(), reset at the start of the next
        self.gold_earned:  int = 0
        self.lives_lost:   int = 0
        self.score_earned: int = 0

    # ── Public API ────────────────────────────────────────────────────────────

    def start_wave(self, round_num: int) -> None:
        self._spawn_queue  = _build_spawn_queue(round_num)
        self._spawn_timer  = 0.0          # first enemy spawns immediately
        self._started      = True
        self.wave_active   = True
        self.enemies.clear()

    @property
    def is_complete(self) -> bool:
        """True only after a wave has been started and fully cleared."""
        return self._started and not self.wave_active and not self.enemies

    # ── Update / draw ─────────────────────────────────────────────────────────

    def update(self, dt: float) -> None:
        self.gold_earned  = 0
        self.lives_lost   = 0
        self.score_earned = 0

        if not self.wave_active:
            return

        self._spawn_timer -= dt
        if self._spawn_timer <= 0 and self._spawn_queue:
            enemy_cls = self._spawn_queue.pop(0)
            self.enemies.append(enemy_cls(self.pixel_waypoints))
            self._spawn_timer = SPAWN_INTERVAL

        alive = []
        for enemy in self.enemies:
            enemy.update(dt)
            if enemy.reached_end:
                self.lives_lost += 1
            elif not enemy.alive:
                self.gold_earned  += enemy.gold
                self.score_earned += enemy.score
            else:
                alive.append(enemy)
        self.enemies = alive

        if not self._spawn_queue and not self.enemies:
            self.wave_active = False

    def draw(self, surface) -> None:
        for enemy in self.enemies:
            enemy.draw(surface)
