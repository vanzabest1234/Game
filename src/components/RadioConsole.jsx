import { useEffect, useRef, useState } from 'react'

function Typewriter({ text, speed = 26 }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    setN(0)
    if (!text) return undefined
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id)
          return v
        }
        return v + 1
      })
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="caret" aria-hidden="true" />}
    </>
  )
}

function Waveform({ live, tension }) {
  const bars = 26
  return (
    <div className={`waveform ${live ? 'is-live' : ''}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const base = 12 + ((i * 37) % 46)
        return (
          <span
            key={i}
            style={{
              height: `${live ? base : 6}%`,
              animationDelay: `${(i % 7) * 0.11}s`,
              animationDuration: `${0.6 + ((i * 13) % 9) / 20}s`,
              opacity: live ? 0.55 + (tension / 100) * 0.45 : 0.22,
            }}
          />
        )
      })}
    </div>
  )
}

export default function RadioConsole({
  phase,
  call,
  lines,
  lineIndex,
  tension,
  onAnswer,
  onSkip,
  onRewind,
}) {
  const live = phase === 'call'
  const incoming = phase === 'incoming'
  const ended = phase === 'dispatch' || phase === 'outcome'
  const scroller = useRef(null)

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
  }, [lineIndex, phase])

  if (!call) return null

  return (
    <section className="panel console" aria-label="Radio console">
      <div className="panel__head">
        <span className="panel__title">RECEIVER</span>
        <span className="panel__meta">{call.channel}</span>
      </div>

      <div className={`caller-card ${incoming ? 'is-ringing' : ''}`}>
        <div className="caller-card__status">
          {incoming && 'INCOMING CALL'}
          {live && <span className="live-dot">LINE OPEN</span>}
          {ended && 'LINE CLOSED'}
        </div>
        <div className="caller-card__name">{incoming ? 'UNKNOWN CALLER' : call.caller}</div>
        <div className="caller-card__sub">{incoming ? 'RINGING…' : call.callerSub}</div>
        <Waveform live={live} tension={tension} />
        {incoming && (
          <button type="button" className="btn btn--answer" onClick={onAnswer}>
            Answer
          </button>
        )}
      </div>

      <div className="transcript" ref={scroller} aria-live="polite">
        {incoming && (
          <p className="transcript__hint">
            <span className="blink">▮</span> The switchboard is routing a call to your desk.
          </p>
        )}

        {!incoming &&
          lines.map((line, i) => {
            if (i > lineIndex) return null
            const isCurrent = i === lineIndex && phase === 'call'
            return (
              <p
                key={i}
                className={`transcript__line ${line.radio ? 'is-radio' : ''} ${
                  line.fx === 'static' ? 'is-static' : ''
                }`}
              >
                <span className="transcript__num">{String(i + 1).padStart(3, '0')}</span>
                <span className="transcript__text">
                  {isCurrent ? <Typewriter text={line.t} /> : line.t}
                </span>
              </p>
            )
          })}

        {ended && <p className="transcript__end">— END OF TAPE —</p>}
      </div>

      <div className="console__controls">
        {phase === 'call' && (
          <button type="button" className="btn btn--ghost" onClick={onSkip}>
            Skip ahead ▸▸
          </button>
        )}
        {phase === 'dispatch' && (
          <button type="button" className="btn btn--ghost" onClick={onRewind}>
            ⟲ Rewind tape
          </button>
        )}
        <span className="console__hint">
          {phase === 'call' && 'Listen, then dispatch.'}
          {phase === 'dispatch' && 'Choose one instruction.'}
          {phase === 'outcome' && 'Line closed. Log the call.'}
          {phase === 'incoming' && 'Answer the line.'}
        </span>
      </div>
    </section>
  )
}
