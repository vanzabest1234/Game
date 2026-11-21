export default function CallLog({ history }) {
  return (
    <section className="panel log" aria-label="Call log">
      <div className="panel__head">
        <span className="panel__title">TONIGHT&apos;S LOG</span>
        <span className="panel__meta">{history.length} FILED</span>
      </div>
      {history.length === 0 ? (
        <p className="log__empty">No calls filed yet.</p>
      ) : (
        <ul className="log__list">
          {history.map((h) => (
            <li key={h.id} className={h.correct ? 'is-good' : 'is-bad'}>
              <span className="log__clock">{h.clock}</span>
              <span className="log__caller">
                {h.caller}
                <em>{h.channel}</em>
              </span>
              <span className="log__status">{h.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
