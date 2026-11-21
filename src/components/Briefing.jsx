import { NIGHT } from '../game/night'

export default function Briefing({ onClockIn }) {
  return (
    <div className="scr scr--brief">
      <div className="brief__head">
        <span className="brief__rec" aria-hidden="true" />
        SHIFT LOG · 02:14
      </div>
      <div className="brief__lines">
        {NIGHT.opening.lines.map((line, i) => (
          <p key={i} style={{ animationDelay: `${i * 0.28}s` }}>
            {line}
          </p>
        ))}
      </div>
      <button type="button" className="brief__foot blink" onClick={onClockIn}>
        TAP TO CLOCK IN
      </button>
    </div>
  )
}
