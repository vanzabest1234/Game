const rating = (messUps) => {
  if (messUps === 0) return 'CLEAN SHIFT'
  if (messUps === 1) return 'STEADY HANDS'
  if (messUps === 2) return 'ROUGH NIGHT'
  return 'SIGNAL LOST'
}

export default function EndingScreen({ data, history, messUps, total, onRestart, onTitle }) {
  return (
    <div className="end">
      <div className="end__tag">{data.tag}</div>
      <h2 className="end__title">{data.title}</h2>

      <div className="end__lines">
        {data.lines.map((line, i) => (
          <p key={i} style={{ animationDelay: `${i * 0.4}s` }}>
            {line}
          </p>
        ))}
      </div>

      <div className="end__stats">
        <span>
          CALLS <b>{history.length}</b>/{total}
        </span>
        <span>
          MESS-UPS <b>{messUps}</b>/3
        </span>
      </div>

      <div className="end__rating">{rating(messUps)}</div>

      <div className="end__foot">
        <button type="button" onClick={onRestart}>
          DRIVE AGAIN
        </button>
        <button type="button" onClick={onTitle}>
          TITLE
        </button>
      </div>
    </div>
  )
}
