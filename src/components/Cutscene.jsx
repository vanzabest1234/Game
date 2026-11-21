export default function Cutscene({
  intro = [],
  actions = [],
  actionIndex = 0,
  onSelect,
  onAct,
}) {
  return (
    <div className="cut">
      <div className="cut__stamp">GETTING OUT</div>
      <div className="cut__intro">
        {intro.map((line, i) => (
          <p key={i} style={{ animationDelay: `${i * 0.55}s` }}>
            {line}
          </p>
        ))}
      </div>
      <div className="cut__prompt">WHAT DO YOU DO?</div>
      <div className="cut__actions">
        {actions.map((a, i) => (
          <button
            key={a.key}
            type="button"
            className={`act ${i === actionIndex ? 'is-sel' : ''}`}
            onClick={() => onAct(a)}
            onMouseEnter={() => onSelect(i)}
            onFocus={() => onSelect(i)}
          >
            <span className="act__cur" aria-hidden="true">
              {i === actionIndex ? '▶' : ' '}
            </span>
            <span className="act__label">{a.label}</span>
          </button>
        ))}
      </div>
      <div className="cut__hint">TAP AN ACTION · ↑↓ + ENTER</div>
    </div>
  )
}
