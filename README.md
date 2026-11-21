# DEAD AIR

A Game Boy-style psychological horror game about a night shift on the road.

You are Unit 7, the only county car out during a blizzard. Dispatch sends you an
address. You drive, you call the people inside, and then you choose:

- **A — Go in.** Leave the car, handle whatever is happening, and pick your
  actions carefully.
- **B — Disclose.** Stay in the car and radio the call in to dispatch.

One of those is right for each address. Get it wrong and the county keeps a
receipt: three mess-ups and the night is lost.

## Play

```bash
npm install
npm run dev
```

Open http://localhost:3000. The whole game runs on a 160×144 green LCD screen
with a dot-matrix finish. Tap or click the choices on screen, or use a keyboard:

- **Enter / Space** — continue
- **Arrow Up / Down** — choose an action
- **Escape** — back / title
- **M** — sound on/off

Headphones recommended. All audio is synthesised live with the Web Audio API:
the engine, the road hiss, the static, the chiptune beeps.

Callers are voiced by free, open Piper neural voices running on the device
(`@diffusionstudio/vits-web`) — no API key and no server. The two voice models
are about 60 MB each and download once on first visit, cached afterwards; the
title screen shows their progress. If they cannot load, the game falls back to
the browser's built-in speech voice.

## How a night runs

1. **Drive.** Dispatch gives you an address. The road scrolls; press A to place
   the call (it dials itself if you wait).
2. **Listen.** The caller describes what is happening while you drive. Skip
   ahead with A.
3. **Arrive.** The car stops. Choose **GO IN** or **DISCLOSE**.
4. **Cutscene.** If you go in, you get out of the car, see the scene, and pick
   one of three actions. Only one is clean.
5. **Log it.** A clean call keeps the interference down. A mess-up raises it,
   adds a line to the dispatch log, and comes back later.
6. **04:00.** Survive all five addresses with fewer than three mess-ups.

## Layout

```
src/
  App.jsx                 screen phases, input, and the LCD frame
  audio/engine.js         engine, wind, static, chiptune, caller voice
  audio/voice.js          on-device Piper voice playback
  game/night.js           the five addresses, actions and endings
  game/useNight.js        drive/call/arrive/cutscene state machine
  components/             GameBoy shell, road, scenes, HUD, call, choices
  styles.css              DMG palette, dot-matrix screen, handheld plastic
```

## Build

```bash
npm run build
```
