export default function DispatchPanel({ phase, call, chosen, onChoose, onAdvance, ending }) {
  if (!call) return null

  const verdict = chosen ? (chosen.correct ? 'RESOLVED' : 'SIGNAL LOST') : null

  return (
    <section className="panel dispatch" aria-label="Dispatch instructions">
      <div className="panel__head">
        <span className="panel__title">DISPATCH</span>
        <span className="panel__meta">{phase === 'dispatch' ? 'AWAITING ORDER' : 'STANDBY'}</span>
      </div>

      {(phase === 'incoming' || phase === 'call') && (
        <div className="dispatch__standby">
          <p className="dispatch__prompt">Listen to the full report before you advise.</p>
          <ul className="dispatch__locked">
            {call.options.map((o) => (
              <li key={o.key}>
                <span className="key">{o.key}</span>
                <span className="locked-bar" />
              </li>
            ))}
          </ul>
          <p className="dispatch__note">
            One instruction per call. Whatever you say, they will do.
          </p>
        </div>
      )}

      {phase === 'dispatch' && (
        <div className="dispatch__options">
          <p className="dispatch__prompt">{call.prompt}</p>
          {call.options.map((o) => (
            <button
              key={o.key}
              type="button"
              className="option"
              onClick={() => onChoose(o)}
            >
              <span className="option__key">{o.key}</span>
              <span className="option__text">{o.text}</span>
            </button>
          ))}
        </div>
      )}

      {phase === 'outcome' && chosen && (
        <div className={`outcome outcome--${chosen.correct ? 'good' : 'bad'}`}>
          <div className={`outcome__stamp outcome__stamp--${chosen.correct ? 'good' : 'bad'}`}>
            {verdict}
          </div>
          <p className="outcome__order">
            <span className="option__key">{chosen.key}</span> {chosen.text}
          </p>
          <div className="outcome__lines">
            {chosen.result.map((line, i) => (
              <p key={i} style={{ animationDelay: `${0.15 + i * 0.45}s` }}>
                {line}
              </p>
            ))}
          </div>
          <button type="button" className="btn btn--primary btn--wide" onClick={onAdvance}>
            {ending ? 'Close the log' : 'Log the call ▸'}
          </button>
        </div>
      )}
    </section>
  )
}
