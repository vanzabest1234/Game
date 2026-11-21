export default function OutcomePanel({ result, onContinue }) {
  return (
    <div className="out" data-good={result.good ? 'yes' : 'no'}>
      <div className="out__tag">{result.good ? 'HANDLED' : 'MESS-UP'}</div>

      {result.radio && <div className="out__radio">{result.radio}</div>}

      <div className="out__lines">
        {result.lines.map((line, i) => (
          <p key={i} style={{ animationDelay: `${i * 0.35}s` }}>
            {line}
          </p>
        ))}
      </div>

      {result.consequence && (
        <div className="out__con">
          <span>DISPATCH LOG</span>
          {result.consequence}
        </div>
      )}

      <button type="button" className="out__continue" onClick={onContinue}>
        CONTINUE ▸
      </button>
    </div>
  )
}
