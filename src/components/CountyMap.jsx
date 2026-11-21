import { MAP } from '../game/calls'

const POINTS = Object.entries(MAP.points)

export default function CountyMap({ marker, tension, phase }) {
  const active = marker ? MAP.points[marker] : null
  const live = phase === 'call' || phase === 'incoming'

  return (
    <section className="panel map-panel" aria-label="County map">
      <div className="panel__head">
        <span className="panel__title">KETTLE COUNTY</span>
        <span className="panel__meta">GRID 4 · N ↑</span>
      </div>

      <div className={`map ${tension >= 60 ? 'is-strained' : ''}`}>
        <svg viewBox={MAP.viewBox} role="img" aria-label="County map with the relay tower and caller locations">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(140,180,180,0.09)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,186,90,0.55)" />
              <stop offset="100%" stopColor="rgba(255,186,90,0)" />
            </radialGradient>
          </defs>

          <rect width="360" height="300" fill="url(#grid)" />

          <path d={MAP.river} className="map__river" />
          <text x="258" y="98" className="map__water">MILL CREEK</text>

          {MAP.roads.map((d, i) => (
            <path key={i} d={d} className={`map__road ${i === 0 ? 'map__road--main' : ''}`} />
          ))}
          <text x="196" y="52" className="map__roadlabel">RT 9</text>

          <g className="map__bridge">
            <line x1={MAP.bridge.x - 6} y1={MAP.bridge.y - 6} x2={MAP.bridge.x + 6} y2={MAP.bridge.y + 6} />
            <line x1={MAP.bridge.x + 6} y1={MAP.bridge.y - 6} x2={MAP.bridge.x - 6} y2={MAP.bridge.y + 6} />
            <text x={MAP.bridge.x + 10} y={MAP.bridge.y - 8}>CLOSED</text>
          </g>

          {active && (
            <line
              x1={MAP.points.tower.x}
              y1={MAP.points.tower.y}
              x2={active.x}
              y2={active.y}
              className="map__link"
            />
          )}

          {POINTS.map(([id, p]) => {
            const isActive = id === marker
            const isTower = id === 'tower'
            return (
              <g key={id} className={`map__point ${isActive ? 'is-active' : ''} ${isTower ? 'is-tower' : ''}`}>
                {isActive && <circle cx={p.x} cy={p.y} r="14" className="map__ping" />}
                {isTower && <circle cx={p.x} cy={p.y} r="26" fill="url(#beaconGlow)" className="map__glow" />}
                <circle cx={p.x} cy={p.y} r={isTower ? 4 : 3} className="map__dot" />
                <text x={p.x} y={p.y - 8} className="map__label">
                  {p.label}
                </text>
                {p.sub && (
                  <text x={p.x} y={p.y + 13} className="map__sublabel">
                    {p.sub}
                  </text>
                )}
              </g>
            )
          })}

          <g className="map__compass">
            <text x="336" y="22">N</text>
            <line x1="338" y1="28" x2="338" y2="44" />
          </g>
        </svg>
        <div className="map__scan" aria-hidden="true" />
        <div className="map__status">
          <span className={live ? 'dot dot--live' : 'dot'} />
          {live ? 'SIGNAL LOCK' : 'IDLE'}
          <span className="map__status-sep">·</span>
          BEACON {tension >= 70 ? 'ERRATIC' : '2 / 10s'}
        </div>
      </div>
    </section>
  )
}
