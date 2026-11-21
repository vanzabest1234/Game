import { OPENING } from '../game/calls'

export default function Briefing({ onClockIn }) {
  return (
    <div className="screen briefing">
      <div className="briefing__panel">
        <div className="briefing__head">
          <span className="rec-dot" /> SHIFT LOG · KETTLE RIDGE RELAY · 02:14
        </div>
        <div className="briefing__lines">
          {OPENING.lines.map((line, i) => (
            <p key={i} style={{ animationDelay: `${i * 0.5}s` }}>
              {line}
            </p>
          ))}
        </div>
        <button
          className="btn btn--primary"
          onClick={onClockIn}
          type="button"
          autoFocus
        >
          Clock in
        </button>
      </div>
    </div>
  )
}
