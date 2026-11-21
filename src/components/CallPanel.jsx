import { useEffect, useState } from 'react'

function Typewriter({ text, speed = 18 }) {
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

function Wave() {
  return (
    <div className="call__wave" aria-hidden="true">
      {Array.from({ length: 11 }).map((_, i) => (
        <span key={i} style={{ animationDelay: `${(i % 5) * 0.12}s` }} />
      ))}
    </div>
  )
}

export default function CallPanel({ call, lines, lineIndex, onSkip }) {
  const start = Math.max(0, lineIndex - 2)
  const visible = lines.slice(start, lineIndex + 1)

  return (
    <div className="call">
      <div className="call__head">
        <span className="call__name">{call.caller}</span>
        <span className="call__chan">{call.channel}</span>
      </div>
      <div className="call__sub">{call.callerSub}</div>
      <Wave />
      <div className="call__transcript" aria-live="polite">
        {visible.map((line, i) => {
          const isNow = start + i === lineIndex
          return (
            <p
              key={`${lineIndex}-${i}`}
              className={`${isNow ? 'is-now' : ''} ${line.fx === 'static' ? 'is-static' : ''}`}
            >
              {isNow ? <Typewriter text={line.t} /> : line.t}
            </p>
          )
        })}
      </div>
      <div className="call__foot">
        <span className="blink">●</span> LINE OPEN
        <button type="button" className="call__skip" onClick={onSkip}>
          SKIP ▸
        </button>
      </div>
    </div>
  )
}
