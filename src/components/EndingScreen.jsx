export default function EndingScreen({ data, history, onRestart, onTitle }) {
  const resolved = history.filter((h) => h.correct).length
  const lost = history.filter((h) => !h.correct).length

  return (
    <div className={`screen ending ending--${data.tag === 'SURVIVED' ? 'good' : 'bad'}`}>
      <div className="ending__panel">
        <div className="ending__tag">{data.tag}</div>
        <h2 className="ending__title">{data.title}</h2>
        <div className="ending__lines">
          {data.lines.map((line, i) => (
            <p key={i} style={{ animationDelay: `${0.2 + i * 0.6}s` }}>
              {line}
            </p>
          ))}
        </div>
        <div className="ending__stats">
          <div>
            <span>RESOLVED</span>
            <b>{resolved}</b>
          </div>
          <div>
            <span>LOST</span>
            <b>{lost}</b>
          </div>
          <div>
            <span>SHIFT</span>
            <b>{data.tag === 'SURVIVED' ? 'COMPLETE' : 'INCOMPLETE'}</b>
          </div>
        </div>
        <div className="ending__actions">
          <button type="button" className="btn btn--primary" onClick={onRestart}>
            Work another night
          </button>
          <button type="button" className="btn btn--ghost" onClick={onTitle}>
            Title screen
          </button>
        </div>
      </div>
    </div>
  )
}
