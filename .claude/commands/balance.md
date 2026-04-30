Review the current tower defense balance and flag anything that looks off.

Steps:
1. Read `tower_defense/CLAUDE.md` for the intended design (economy, progression, boss cadence).
2. Read `tower_defense/enemy.py` — collect all enemy types with their health, speed, gold, score values.
3. Read `tower_defense/tower.py` (if it exists) — collect all tower types with damage, attack_speed, range, cost, speciality.
4. Read the wave config (e.g. `tower_defense/waves.py`) if it exists — note which enemy types appear in which rounds.
5. Analyse and report on:

   **Economy**
   - Can the player afford a basic tower on round 1 with starting gold?
   - Does killing a full wave of enemies on a given round generate enough gold to meaningfully upgrade/expand before the next round?
   - Are any towers so cheap they trivialise the game, or so expensive they're never worth buying?

   **DPS vs enemy HP**
   - Estimate how many shots a basic tower needs to kill each enemy type. Flag cases where an enemy is unkillable by a single tower in the time it takes to cross the map.
   - Check that tank enemies take noticeably longer to kill than basic enemies, and fast enemies are genuinely threatening despite lower HP.

   **Progression curve**
   - Do enemy stats scale smoothly across rounds? Flag any sudden spikes or plateaus.
   - Is every 5th round (boss round) meaningfully harder than rounds 4 and 6?

   **Score**
   - Is the score spread across enemy types proportional to difficulty?
   - Does the boss award significantly more score than a regular enemy?

6. Summarise findings as a short bullet list: ✅ looks fine / ⚠️ worth reviewing / ❌ likely broken.
   Include specific numbers when flagging an issue so it's easy to act on.
7. Suggest concrete stat adjustments for anything marked ⚠️ or ❌, but do NOT make code changes — this skill is read-only. Let the user decide what to change.
