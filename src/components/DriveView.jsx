import { useEffect, useRef } from 'react'

// The Game Boy screen is 160x144. The cockpit is drawn at that resolution and
// scaled up with nearest-neighbour so every pixel stays a square.
const W = 160
const H = 144
const P = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
const HORIZON = 56

// Windscreen opening. The interior frame is drawn around it.
const GLASS = { top: 22, bottom: 84, leftTop: 13, rightTop: 147, leftBottom: 6, rightBottom: 154 }

const yOf = (z) => HORIZON + (H - HORIZON) * Math.pow(z, 1.7)
const halfOf = (z) => 5 + 118 * z

export default function DriveView({ speed = 1, arrived = false, tension = 0.1, title = false }) {
  const canvasRef = useRef(null)
  const propsRef = useRef({ speed, arrived, tension, title })

  propsRef.current = { speed, arrived, tension, title }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    const state = {
      t: 0,
      scroll: 0,
      v: title ? 0.45 : 0.9,
      look: 0,
      lookTarget: 0,
      mouse: 0,
      keys: { left: false, right: false },
      stars: Array.from({ length: 26 }, () => ({
        x: Math.random() * W,
        y: 24 + Math.random() * 28,
      })),
      snow: Array.from({ length: 64 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 0.35 + Math.random() * 1.1,
      })),
    }

    // Head turn: the mouse across the screen, or A/D, glances down the road.
    const onMove = (e) => {
      const nx = e.clientX / Math.max(1, window.innerWidth)
      state.mouse = Math.max(-1, Math.min(1, (nx - 0.5) * 2.2))
    }
    const onLeave = () => {
      state.mouse = 0
    }
    const onDown = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') state.keys.left = true
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') state.keys.right = true
    }
    const onUp = (e) => {
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') state.keys.left = false
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') state.keys.right = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)

    let raf = 0
    let last = performance.now()

    const loop = (now) => {
      const dt = Math.min(48, now - last)
      last = now
      const { speed: sp, arrived: ar, tension: tn, title: ti } = propsRef.current
      const target = ar ? 0 : ti ? 0.45 : sp
      state.v += (target - state.v) * Math.min(1, dt / 420)
      state.t += dt
      state.scroll += state.v * dt * 0.06

      const keyLook = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0)
      const lookTarget = keyLook !== 0 ? keyLook : state.mouse
      state.look += (lookTarget - state.look) * Math.min(1, dt / 150)

      for (const p of state.snow) {
        p.y += (0.02 + state.v * 0.075) * p.s * dt
        p.x -= state.v * 0.018 * dt * p.s
        if (p.y > H + 2) {
          p.y = -2
          p.x = Math.random() * W
        }
        if (p.x < -2) p.x = W + 2
      }

      draw(ctx, state, tn, ar, ti)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
    // The animation reads its props from propsRef, so it only starts once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="drive-canvas"
      width={W}
      height={H}
      aria-hidden="true"
    />
  )
}

function windshieldPath(ctx) {
  ctx.beginPath()
  ctx.moveTo(GLASS.leftTop, GLASS.top)
  ctx.lineTo(GLASS.rightTop, GLASS.top)
  ctx.lineTo(GLASS.rightBottom, GLASS.bottom)
  ctx.lineTo(GLASS.leftBottom, GLASS.bottom)
  ctx.closePath()
}

function pxLine(ctx, x0, y0, x1, y1) {
  let x = x0
  let y = y0
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  for (;;) {
    ctx.fillRect(x, y, 1, 1)
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
}

function draw(ctx, state, tension, arrived, title) {
  // Near objects swing further than the road when you turn your head.
  const worldShift = -state.look * 3
  const nearShift = -state.look * 6

  ctx.fillStyle = P[0]
  ctx.fillRect(0, 0, W, H)

  // Everything outside the car, seen through the windscreen.
  ctx.save()
  ctx.translate(nearShift, 0)
  windshieldPath(ctx)
  ctx.clip()
  ctx.translate(worldShift - nearShift, 0)
  drawWorld(ctx, state, tension, arrived, title)
  ctx.restore()

  // The cabin around it.
  ctx.save()
  ctx.translate(nearShift, 0)
  drawCockpit(ctx, state, tension)
  ctx.restore()
}

function curveAt(state, z) {
  return Math.sin(state.scroll * 0.0032) * 20 * z * z
}

function drawWorld(ctx, state, tension, arrived, title) {
  const scroll = state.scroll
  const v = state.v
  const cx = (z) => 80 + curveAt(state, z)
  const y = yOf
  const half = halfOf

  // Night sky and the haze of a blizzard. Kept lighter than the cabin so the
  // interior reads as a silhouette.
  ctx.fillStyle = P[1]
  ctx.fillRect(-24, 0, W + 48, H)
  ctx.fillStyle = P[2]
  for (const s of state.stars) ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1)
  ctx.fillRect(-24, HORIZON - 13, W + 48, 13)

  // Snowfield.
  ctx.fillStyle = P[2]
  ctx.fillRect(-24, HORIZON, W + 48, H - HORIZON)
  ctx.fillStyle = P[1]
  for (let i = 0; i < 120; i += 1) {
    if (i % 5 === 0) continue
    const sx = ((i * 37) % (W + 48)) - 24
    const sy = HORIZON + 3 + ((i * 53) % 70)
    ctx.fillRect(sx, sy, 1, 1)
  }

  // Treeline along the horizon: little conifers, not a bar graph.
  ctx.fillStyle = P[0]
  let tx = -24
  while (tx < W + 24) {
    const h = 5 + ((Math.abs(tx) * 13 + 7) % 10)
    const w = 3 + (Math.abs(tx) % 2)
    ctx.fillRect(tx, HORIZON - h, w, h)
    ctx.fillRect(tx + 1, HORIZON - h - 2, Math.max(1, w - 2), 2)
    tx += w + 2 + (Math.abs(tx) % 3)
  }

  // Road surface.
  ctx.fillStyle = P[1]
  ctx.beginPath()
  ctx.moveTo(cx(0) - half(0), y(0))
  for (let i = 1; i <= 26; i += 1) {
    const z = i / 26
    ctx.lineTo(cx(z) - half(z), y(z))
  }
  for (let i = 26; i >= 0; i -= 1) {
    const z = i / 26
    ctx.lineTo(cx(z) + half(z), y(z))
  }
  ctx.closePath()
  ctx.fill()

  // Ploughed banks at the edge of the tarmac.
  ctx.fillStyle = P[3]
  for (let i = 0; i < 18; i += 1) {
    const z = (i / 18 + ((scroll * 0.004) % 1)) % 1
    if (z < 0.05) continue
    const side = i % 2 === 0 ? -1 : 1
    const px = cx(z) + side * half(z) * 1.04
    ctx.fillRect(Math.round(px), Math.round(y(z) + 1), Math.max(1, Math.round(z * 4)), 1)
  }

  // Headlight wash on the snow ahead.
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = P[3]
  ctx.beginPath()
  ctx.moveTo(38, H)
  ctx.lineTo(cx(0.42) - 44, y(0.42))
  ctx.lineTo(cx(0.42) + 44, y(0.42))
  ctx.lineTo(122, H)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Centre dashes, scrolling toward the car.
  const phase = (scroll * 0.004) % 1
  for (let i = 0; i < 8; i += 1) {
    const z = (i / 8 + phase) % 1
    if (z < 0.04) continue
    const w = 1 + z * 3
    const len = 1 + z * 9
    ctx.fillStyle = P[3]
    ctx.fillRect(
      Math.round(cx(z) - w / 2),
      Math.round(y(z) - len),
      Math.max(1, Math.round(w)),
      Math.max(1, Math.round(len)),
    )
  }

  // Roadside poles.
  for (let i = 0; i < 6; i += 1) {
    const z = (i / 6 + phase * 0.8) % 1
    const side = i % 2 === 0 ? -1 : 1
    const px = cx(z) + side * half(z) * 1.22
    const py = y(z)
    const ph = 3 + z * 26
    ctx.fillStyle = P[0]
    ctx.fillRect(Math.round(px - 1), Math.round(py - ph), 2, Math.round(ph))
    ctx.fillRect(Math.round(px - 4), Math.round(py - ph + 2), 8, 1)
  }

  // The shape at the treeline, once the night has gone wrong.
  if (tension > 0.52 && !title) {
    const ex = 116 + Math.sin(state.t * 0.0006) * 5
    const ey = HORIZON + 10
    const h = 24 + tension * 6
    ctx.fillStyle = P[0]
    ctx.fillRect(ex, ey - h, 4, h)
    ctx.beginPath()
    ctx.arc(ex + 2, ey - h - 3, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = P[3]
    ctx.fillRect(ex + 3, ey - h, 1, h)
  }

  // Arrival: a lit house at the edge of the headlights.
  if (arrived) {
    const hx = 32
    const hy = 62
    ctx.fillStyle = P[0]
    ctx.fillRect(hx, hy, 34, 26)
    ctx.beginPath()
    ctx.moveTo(hx - 4, hy)
    ctx.lineTo(hx + 17, hy - 12)
    ctx.lineTo(hx + 38, hy)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = P[2]
    ctx.fillRect(hx - 2, hy - 1, 38, 1)
    ctx.fillStyle = P[3]
    ctx.fillRect(hx + 6, hy + 7, 8, 7)
    ctx.fillStyle = P[1]
    ctx.fillRect(hx + 22, hy + 8, 7, 18)
  }

  // Snow through the beams, plus a little settled on the glass.
  ctx.fillStyle = P[3]
  for (const p of state.snow) {
    const size = p.s > 1.15 ? 2 : 1
    ctx.fillRect(Math.round(p.x), Math.round(p.y), size, size)
  }

  // Glass glare.
  ctx.save()
  ctx.globalAlpha = 0.07
  ctx.fillStyle = P[3]
  ctx.beginPath()
  ctx.moveTo(26, GLASS.bottom)
  ctx.lineTo(72, GLASS.top)
  ctx.lineTo(92, GLASS.top)
  ctx.lineTo(48, GLASS.bottom)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Speed streaks at the edge of the frame.
  if (v > 0.55) {
    ctx.fillStyle = P[3]
    for (let i = 0; i < 5; i += 1) {
      const sy = 40 + i * 11
      const sx = i % 2 === 0 ? -4 : W - 4
      ctx.fillRect(sx, sy, 4, 1)
    }
  }
}

function drawCockpit(ctx, state, tension) {
  const t = state.t

  // Headliner.
  ctx.fillStyle = P[0]
  ctx.fillRect(-16, 0, W + 32, GLASS.top + 2)

  // A-pillars.
  ctx.beginPath()
  ctx.moveTo(-16, 0)
  ctx.lineTo(GLASS.leftTop + 3, 0)
  ctx.lineTo(GLASS.leftBottom, GLASS.bottom)
  ctx.lineTo(-16, GLASS.bottom)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(W + 16, 0)
  ctx.lineTo(GLASS.rightTop - 3, 0)
  ctx.lineTo(GLASS.rightBottom, GLASS.bottom)
  ctx.lineTo(W + 16, GLASS.bottom)
  ctx.closePath()
  ctx.fill()

  // A thin edge of light along the pillars.
  ctx.fillStyle = P[1]
  pxLine(ctx, GLASS.leftTop + 3, GLASS.top, GLASS.leftBottom + 1, GLASS.bottom - 1)
  pxLine(ctx, GLASS.rightTop - 3, GLASS.top, GLASS.rightBottom - 1, GLASS.bottom - 1)

  // Rear-view mirror.
  ctx.fillStyle = P[0]
  ctx.fillRect(79, GLASS.top - 3, 3, 8)
  ctx.fillRect(63, GLASS.top + 4, 34, 13)
  ctx.fillStyle = P[2]
  ctx.fillRect(67, GLASS.top + 13, 26, 1)
  ctx.fillStyle = P[3]
  ctx.fillRect(68, GLASS.top + 7, 7, 1)

  // Dashboard slab.
  ctx.fillStyle = P[0]
  ctx.fillRect(-16, GLASS.bottom - 1, W + 32, H - GLASS.bottom + 1)
  ctx.fillStyle = P[1]
  ctx.fillRect(-16, GLASS.bottom - 1, W + 32, 1)
  ctx.fillRect(-16, 102, 26, 1)
  ctx.fillRect(132, 102, 44, 1)

  // Radio: a lit little screen with a live waveform.
  const sx = 30
  const sy = 86
  const sw = 36
  const sh = 13
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = P[3]
  ctx.fillRect(sx - 5, sy - 5, sw + 10, sh + 10)
  ctx.restore()
  ctx.fillStyle = P[3]
  ctx.fillRect(sx, sy, sw, sh)
  ctx.fillStyle = P[0]
  for (let i = 0; i < 11; i += 1) {
    const bh = 2 + Math.round((Math.sin(t * 0.006 + i * 0.9) * 0.5 + 0.5) * 6)
    ctx.fillRect(sx + 2 + i * 3, sy + sh - 1 - bh, 1, bh)
  }
  ctx.fillRect(sx, sy + sh - 1, sw, 1)

  // Dash vents.
  ctx.fillStyle = P[1]
  ctx.fillRect(72, 87, 14, 9)
  ctx.fillRect(92, 87, 14, 9)
  ctx.fillStyle = P[0]
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(74, 89 + i * 2, 10, 1)
    ctx.fillRect(94, 89 + i * 2, 10, 1)
  }

  // Coffee cup on the dash.
  ctx.fillStyle = P[1]
  ctx.fillRect(136, 72, 8, 11)
  ctx.fillStyle = P[0]
  ctx.fillRect(135, 70, 10, 2)
  ctx.fillStyle = P[3]
  ctx.fillRect(137, 73, 1, 9)
  ctx.fillStyle = P[0]
  ctx.fillRect(143, 75, 2, 5)

  // Steering wheel, pixel blocks so the rim stays crisp.
  const wx = 80
  const wy = 140
  const wr = 44
  for (let a = Math.PI * 1.08; a <= Math.PI * 1.92; a += 0.03) {
    const px = Math.round(wx + Math.cos(a) * wr)
    const py = Math.round(wy + Math.sin(a) * wr)
    ctx.fillStyle = P[1]
    ctx.fillRect(px - 2, py - 2, 4, 4)
  }
  ctx.fillStyle = P[0]
  for (let a = Math.PI * 1.12; a <= Math.PI * 1.88; a += 0.05) {
    const px = Math.round(wx + Math.cos(a) * (wr - 1))
    const py = Math.round(wy + Math.sin(a) * (wr - 1))
    ctx.fillRect(px, py, 1, 1)
  }
  ctx.fillStyle = P[1]
  pxLine(ctx, 80, 122, 62, 100)
  pxLine(ctx, 80, 122, 98, 100)
  ctx.fillRect(79, 100, 2, 22)
  ctx.fillStyle = P[3]
  ctx.fillRect(78, 94, 4, 1)

  // Seat bolsters in the foreground, fabric picked out in mid tone.
  for (const side of [-1, 1]) {
    const x0 = side === -1 ? -16 : W - 12
    ctx.fillStyle = P[0]
    ctx.fillRect(x0, 88, 28, 56)
    ctx.fillStyle = P[1]
    ctx.fillRect(x0, 88, 28, 1)
    for (let yy = 88; yy < H; yy += 2) {
      for (let xx = x0; xx < x0 + 28; xx += 2) {
        if ((xx + yy) % 6 < 2) ctx.fillRect(xx, yy, 2, 2)
      }
    }
  }

  // A little snow crust where the wipers rest.
  ctx.fillStyle = P[3]
  for (let i = 0; i < 26; i += 1) {
    const px = 10 + ((i * 29) % 140)
    if ((i * 7) % 3 === 0) ctx.fillRect(px, GLASS.bottom - 3 + (i % 2), 1, 1)
  }

  // The radio's glow spilling onto the dash.
  if (tension > 0.4) {
    ctx.save()
    ctx.globalAlpha = 0.1
    ctx.fillStyle = P[3]
    ctx.fillRect(sx - 10, sy + sh, sw + 20, 6)
    ctx.restore()
  }
}
