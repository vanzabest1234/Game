import { useEffect, useRef } from 'react'

// The Game Boy screen is 160x144. The road is drawn at that resolution and
// scaled up with nearest-neighbour so every pixel stays a square.
const W = 160
const H = 144
const P = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
const HORIZON = 54

const yOf = (z) => HORIZON + (H - HORIZON) * Math.pow(z, 1.7)
const halfOf = (z) => 4 + 118 * z

export default function DriveView({ speed = 1, arrived = false, tension = 0.1, title = false }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
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
      snow: Array.from({ length: 64 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 0.35 + Math.random() * 1.1,
      })),
    }
    stateRef.current = state

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
    return () => cancelAnimationFrame(raf)
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

function curveAt(state, z) {
  return Math.sin(state.scroll * 0.004) * 26 * z * z
}

function draw(ctx, state, tension, arrived, title) {
  const scroll = state.scroll
  const v = state.v
  const cx = (z) => 80 + curveAt(state, z)
  const half = halfOf
  const y = yOf

  // Sky and horizon.
  ctx.fillStyle = P[0]
  ctx.fillRect(0, 0, W, HORIZON + 2)
  ctx.fillStyle = P[1]
  ctx.fillRect(0, HORIZON - 9, W, 11)

  // Snowfield.
  ctx.fillStyle = P[2]
  ctx.fillRect(0, HORIZON, W, H - HORIZON)

  // Treeline along the horizon.
  ctx.fillStyle = P[0]
  let tx = 0
  while (tx < W) {
    const h = 5 + ((tx * 13 + 7) % 9)
    ctx.fillRect(tx, HORIZON - h, 3, h)
    tx += 3 + (tx % 2)
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

  // Road edges.
  ctx.strokeStyle = P[0]
  ctx.lineWidth = 1
  for (const side of [-1, 1]) {
    ctx.beginPath()
    for (let i = 0; i <= 26; i += 1) {
      const z = i / 26
      const px = cx(z) + side * half(z)
      if (i === 0) ctx.moveTo(px, y(z))
      else ctx.lineTo(px, y(z))
    }
    ctx.stroke()
  }

  // Centre dashes, scrolling toward the car.
  const phase = (scroll * 0.004) % 1
  for (let i = 0; i < 8; i += 1) {
    const z = (i / 8 + phase) % 1
    if (z < 0.04) continue
    const w = 1 + z * 3
    const len = 1 + z * 9
    ctx.fillStyle = P[3]
    ctx.fillRect(Math.round(cx(z) - w / 2), Math.round(y(z) - len), Math.max(1, Math.round(w)), Math.max(1, Math.round(len)))
  }

  // Roadside poles.
  for (let i = 0; i < 6; i += 1) {
    const z = ((i / 6 + phase * 0.8) % 1)
    const side = i % 2 === 0 ? -1 : 1
    const px = cx(z) + side * half(z) * 1.22
    const py = y(z)
    const ph = 3 + z * 26
    ctx.fillStyle = P[0]
    ctx.fillRect(Math.round(px - 1), Math.round(py - ph), 2, Math.round(ph))
    ctx.fillRect(Math.round(px - 4), Math.round(py - ph + 2), 8, 1)
  }

  // Snowbanks catch the light at the road edge.
  ctx.fillStyle = P[3]
  for (let i = 0; i < 14; i += 1) {
    const z = (i / 14 + phase * 1.3) % 1
    if (z < 0.08) continue
    const side = i % 2 === 0 ? -1 : 1
    const px = cx(z) + side * half(z) * 1.05
    ctx.fillRect(Math.round(px), Math.round(y(z) + 1), Math.max(1, Math.round(z * 3)), 1)
  }

  // The shape at the treeline, once the night has gone wrong.
  if (tension > 0.52 && !title) {
    const ex = 30 + Math.sin(state.t * 0.0006) * 5
    const ey = HORIZON + 12
    const h = 25 + tension * 6
    ctx.fillStyle = P[0]
    ctx.fillRect(ex, ey - h, 4, h)
    ctx.beginPath()
    ctx.arc(ex + 2, ey - h - 3, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = P[3]
    ctx.fillRect(ex + 3, ey - h, 1, h)
  }

  // Arrival: a house at the edge of the headlights.
  if (arrived) {
    const hx = 100
    const hy = 76
    ctx.fillStyle = P[0]
    ctx.fillRect(hx, hy, 48, 36)
    ctx.beginPath()
    ctx.moveTo(hx - 5, hy)
    ctx.lineTo(hx + 24, hy - 16)
    ctx.lineTo(hx + 53, hy)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = P[2]
    ctx.fillRect(hx - 2, hy - 1, 52, 1)
    ctx.fillStyle = P[3]
    ctx.fillRect(hx + 8, hy + 9, 10, 8)
    ctx.fillRect(hx + 26, hy + 5, 2, 2)
    ctx.fillStyle = P[1]
    ctx.fillRect(hx + 32, hy + 11, 8, 25)
  }

  // Headlight wash on the snow.
  ctx.save()
  ctx.globalAlpha = 0.16
  ctx.fillStyle = P[3]
  ctx.beginPath()
  ctx.moveTo(44, H)
  ctx.lineTo(cx(0.45) - 36, y(0.45))
  ctx.lineTo(cx(0.45) + 36, y(0.45))
  ctx.lineTo(116, H)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Snowflakes.
  ctx.fillStyle = P[3]
  for (const p of state.snow) {
    const size = p.s > 1.15 ? 2 : 1
    ctx.fillRect(Math.round(p.x), Math.round(p.y), size, size)
  }

  // Speed streaks at the edge of the frame.
  if (v > 0.55) {
    ctx.fillStyle = P[3]
    for (let i = 0; i < 5; i += 1) {
      const sy = 62 + i * 13
      const sx = i % 2 === 0 ? 0 : W - 4
      ctx.fillRect(sx, sy, 4, 1)
    }
  }

  // Bonnet.
  ctx.fillStyle = P[0]
  ctx.beginPath()
  ctx.moveTo(-4, H)
  ctx.lineTo(18, H - 22)
  ctx.lineTo(142, H - 22)
  ctx.lineTo(W + 4, H)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = P[2]
  ctx.fillRect(24, H - 23, 112, 1)
  ctx.fillStyle = P[1]
  ctx.fillRect(76, H - 18, 8, 2)
}
