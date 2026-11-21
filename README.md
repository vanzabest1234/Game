# DEAD AIR

A psychological audio horror game. You work the graveyard shift at Kettle Ridge
Relay during a blizzard: take panicked calls, cross-reference the county board,
and send help — while every caller describes the same thing walking toward your
building. You never see it. You only hear it get closer.

## Play

```bash
npm install
npm run dev
```

Open http://localhost:3000. Headphones recommended; the sound design is
synthesised live with the Web Audio API and the callers are voiced with the
browser's speech engine.

## How a night runs

1. **Answer** the incoming line (it connects on its own if you wait).
2. **Listen** — the transcript types out; `Skip ahead` moves to the next line,
   `Rewind tape` replays the whole call.
3. **Dispatch** one of three instructions. Road closures, the beacon schedule and
   the two protocols on the county board decide which one keeps the caller alive.
4. **Log the call.** Wrong advice raises the interference meter, darkens the
   board with a new entry, and comes back in the next caller's background radio.

Four mistakes and the tower is lost. Survive all six calls to reach 04:00.
There is no monster on screen, by design.

## Layout

```
src/
  App.jsx                 screen state + board layout
  audio/engine.js         procedural wind, static, beacon, drone, voice
  game/calls.js           the six calls, bulletin, map and endings
  game/useGame.js         call pacing, dispatch resolution, tension
  components/             title, briefing, console, map, dispatch, board, log, ending
  styles.css              CRT phosphor styling and responsive layout
```

## Build

```bash
npm run build
```
