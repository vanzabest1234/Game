import { useEffect, useRef } from 'react'

// Small pixel scenes for the on-foot cutscenes and the ending.
const W = 160
const H = 144
const P = ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']

export default function SceneView({ kind = 'porch', danger = false }) {
  const canvasRef = useRef(null)
  const propsRef = useRef({ kind, danger })
  propsRef.current = { kind, danger }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const state = {
      t: 0,
      snow: Array.from({ length: 46 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 0.35 + Math.random() * 1.1,
      })),
    }
    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(48, now - last)
      last = now
      state.t += dt
      for (const p of state.snow) {
        p.y += 0.022 * p.s * dt
        p.x -= 0.004 * dt
        if (p.y > H + 2) {
          p.y = -2
          p.x = Math.random() * W
        }
        if (p.x < -2) p.x = W + 2
      }
      const { kind: k, danger: d } = propsRef.current
      draw(ctx, state, k, d)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="scene-canvas" width={W} height={H} aria-hidden="true" />
}

function snow(ctx, state) {
  ctx.fillStyle = P[3]
  for (const p of state.snow) {
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s > 1.15 ? 2 : 1, p.s > 1.15 ? 2 : 1)
  }
}

function figure(ctx, x, y, h, rim = true) {
  ctx.fillStyle = P[0]
  ctx.fillRect(x, y - h, 5, h)
  ctx.beginPath()
  ctx.arc(x + 2.5, y - h - 3, 3.4, 0, Math.PI * 2)
  ctx.fill()
  if (rim) {
    ctx.fillStyle = P[3]
    ctx.fillRect(x + 4, y - h, 1, h)
    ctx.fillRect(x + 4, y - h - 5, 1, 2)
  }
}

function draw(ctx, state, kind, danger) {
  if (kind === 'dawn') return drawDawn(ctx, state)
  if (kind === 'ridge') return drawRidge(ctx, state, danger)
  if (kind === 'car') return drawCar(ctx, state, danger)
  return drawPorch(ctx, state, danger)
}

function drawPorch(ctx, state, danger) {
  ctx.fillStyle = P[0]
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = P[1]
  ctx.fillRect(0, 92, W, H - 92)

  // House.
  ctx.fillStyle = P[0]
  ctx.fillRect(24, 36, 112, 76)
  ctx.beginPath()
  ctx.moveTo(16, 38)
  ctx.lineTo(80, 8)
  ctx.lineTo(144, 38)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = P[2]
  ctx.fillRect(20, 36, 120, 2)
  ctx.fillRect(22, 110, 116, 2)

  // Lit window and dark window.
  ctx.fillStyle = P[3]
  ctx.fillRect(38, 52, 22, 18)
  ctx.fillStyle = P[0]
  ctx.fillRect(48, 52, 2, 18)
  ctx.fillRect(38, 60, 22, 2)
  ctx.fillStyle = P[1]
  ctx.fillRect(104, 52, 20, 18)
  ctx.fillStyle = P[0]
  ctx.fillRect(113, 52, 2, 18)
  ctx.fillRect(104, 60, 20, 2)

  // Door and porch light.
  ctx.fillStyle = P[1]
  ctx.fillRect(70, 66, 24, 46)
  ctx.fillStyle = P[0]
  ctx.fillRect(73, 70, 18, 39)
  ctx.fillStyle = P[3]
  ctx.fillRect(78, 48, 3, 3)
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.beginPath()
  ctx.arc(79.5, 49.5, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Steps.
  ctx.fillStyle = P[2]
  ctx.fillRect(66, 112, 32, 3)
  ctx.fillRect(62, 118, 40, 3)

  if (danger) figure(ctx, 136, 112, 34)
  snow(ctx, state)
}

function drawCar(ctx, state, danger) {
  // Windscreen.
  ctx.fillStyle = P[0]
  ctx.fillRect(0, 0, W, 88)
  ctx.fillStyle = P[2]
  ctx.fillRect(0, 56, W, 32)
  ctx.fillStyle = P[1]
  ctx.beginPath()
  ctx.moveTo(62, 56)
  ctx.lineTo(72, 88)
  ctx.lineTo(98, 88)
  ctx.lineTo(108, 56)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = P[3]
  ctx.fillRect(79, 60, 2, 8)
  ctx.fillRect(79, 74, 2, 6)

  // Something standing in the headlights.
  if (danger) figure(ctx, 34, 82, 30)

  // Dashboard.
  ctx.fillStyle = P[1]
  ctx.fillRect(0, 88, W, H - 88)
  ctx.fillStyle = P[0]
  ctx.fillRect(0, 88, W, 3)
  ctx.fillRect(0, 100, W, 2)

  // Radio.
  ctx.fillStyle = P[0]
  ctx.fillRect(18, 104, 46, 24)
  ctx.fillStyle = P[2]
  ctx.fillRect(21, 107, 40, 10)
  ctx.fillStyle = P[0]
  ctx.fillRect(24, 110, 30, 2)
  ctx.fillRect(24, 114, 18, 2)
  ctx.fillStyle = P[3]
  ctx.fillRect(58, 109, 2, 6)

  // Dials.
  for (const dx of [96, 122]) {
    ctx.fillStyle = P[0]
    ctx.beginPath()
    ctx.arc(dx, 116, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = P[2]
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(dx, 116, 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = P[3]
    ctx.fillRect(dx, 111, 1, 5)
  }

  // Wheel.
  ctx.strokeStyle = P[0]
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(80, 150, 28, Math.PI * 1.05, Math.PI * 1.95)
  ctx.stroke()

  snow(ctx, state)
}

function drawRidge(ctx, state, danger) {
  ctx.fillStyle = P[0]
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = P[3]
  for (let i = 0; i < 18; i += 1) {
    const sx = (i * 53 + 11) % W
    const sy = (i * 29 + 5) % 48
    ctx.fillRect(sx, sy, 1, 1)
  }

  // Tower on the far ridge.
  ctx.fillStyle = P[1]
  ctx.beginPath()
  ctx.moveTo(0, 96)
  ctx.lineTo(44, 72)
  ctx.lineTo(92, 88)
  ctx.lineTo(132, 62)
  ctx.lineTo(160, 74)
  ctx.lineTo(160, 144)
  ctx.lineTo(0, 144)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = P[0]
  ctx.fillRect(124, 22, 3, 42)
  ctx.fillRect(118, 40, 15, 2)
  ctx.fillRect(121, 30, 9, 2)
  if (Math.floor(state.t / 620) % 2 === 0) {
    ctx.fillStyle = P[3]
    ctx.fillRect(125, 18, 1, 1)
    ctx.fillRect(123, 20, 5, 1)
  }

  // Ridge line and lantern.
  ctx.fillStyle = P[1]
  ctx.beginPath()
  ctx.moveTo(0, 122)
  ctx.lineTo(38, 104)
  ctx.lineTo(86, 118)
  ctx.lineTo(130, 98)
  ctx.lineTo(160, 110)
  ctx.lineTo(160, 144)
  ctx.lineTo(0, 144)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = P[3]
  ctx.fillRect(58, 86, 2, 2)
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.arc(59, 87, 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  if (danger) figure(ctx, 104, 120, 30)
  snow(ctx, state)
}

function drawDawn(ctx, state) {
  ctx.fillStyle = P[1]
  ctx.fillRect(0, 0, W, 46)
  ctx.fillStyle = P[2]
  ctx.fillRect(0, 46, W, 26)
  ctx.fillStyle = P[3]
  ctx.fillRect(0, 72, W, 20)
  ctx.fillStyle = P[2]
  ctx.fillRect(0, 92, W, H - 92)

  // Low sun.
  ctx.fillStyle = P[3]
  ctx.beginPath()
  ctx.arc(112, 78, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = P[2]
  ctx.fillRect(0, 84, W, 2)
  ctx.fillRect(0, 88, W, 1)

  // Road out of the county.
  ctx.fillStyle = P[1]
  ctx.beginPath()
  ctx.moveTo(78, 92)
  ctx.lineTo(82, 92)
  ctx.lineTo(120, H)
  ctx.lineTo(30, H)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = P[3]
  ctx.fillRect(79, 96, 2, 8)
  ctx.fillRect(80, 110, 3, 10)

  // Treeline.
  ctx.fillStyle = P[0]
  let tx = 0
  while (tx < W) {
    const h = 4 + ((tx * 11 + 3) % 7)
    ctx.fillRect(tx, 92 - h, 2, h)
    tx += 2 + (tx % 3)
  }

  // Parked county car.
  ctx.fillStyle = P[0]
  ctx.fillRect(16, 118, 34, 12)
  ctx.fillRect(22, 112, 20, 7)
  ctx.fillStyle = P[2]
  ctx.fillRect(24, 113, 16, 4)
  ctx.fillStyle = P[3]
  ctx.fillRect(19, 127, 4, 2)
  ctx.fillRect(43, 127, 4, 2)

  snow(ctx, state)
}
