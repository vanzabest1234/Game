import { useCallback, useEffect, useMemo, useState } from 'react'
import { MAX_MESS_UPS, NIGHT } from './night'

const lineMs = (text) => Math.min(7200, 1600 + text.length * 34)

export function useNight(engine) {
  const [phase, setPhase] = useState('title')
  const [callIndex, setCallIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [messUps, setMessUps] = useState(0)
  const [choice, setChoice] = useState(null)
  const [action, setAction] = useState(null)
  const [actionIndex, setActionIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [ending, setEnding] = useState(null)
  const [muted, setMuted] = useState(false)

  const call = NIGHT.calls[callIndex]
  const lines = useMemo(() => call?.lines || [], [call])
  const currentLine = lines[lineIndex] || null
  const interference = Math.min(100, 10 + messUps * 27 + callIndex * 4)

  useEffect(() => {
    engine.setTension(interference / 100)
  }, [interference, engine])

  useEffect(() => {
    engine.setMuted(muted)
  }, [muted, engine])

  // Engine and road noise run while the car is moving.
  useEffect(() => {
    engine.setDriving(phase === 'drive' || phase === 'call')
  }, [phase, engine])

  // Generate the call ahead of playback.
  useEffect(() => {
    if (!call) return
    engine.prepareLines(
      call.lines.filter((line) => !line.radio).map((line) => line.t),
      call.voice,
    )
  }, [call, engine])

  // Dial the address once the car is rolling. Auto-dial keeps the night moving.
  useEffect(() => {
    if (phase !== 'drive') return
    const ring = setTimeout(() => engine.ring(), 1800)
    const auto = setTimeout(() => {
      engine.connectCall()
      setLineIndex(0)
      setPhase('call')
    }, 9000)
    return () => {
      clearTimeout(ring)
      clearTimeout(auto)
    }
  }, [phase, callIndex, engine])

  // Play the call one line at a time.
  useEffect(() => {
    if (phase !== 'call') return
    const line = lines[lineIndex]
    if (!line) {
      setPhase('arrive')
      return
    }
    if (line.fx === 'static') engine.burst(0.4, 0.18)
    if (!line.radio) engine.speak(line.t, call.voice)

    if (lineIndex >= lines.length - 1) {
      const t = setTimeout(() => {
        engine.cancelSpeech()
        setPhase('arrive')
      }, 1500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setLineIndex((i) => i + 1), lineMs(line.t))
    return () => clearTimeout(t)
  }, [phase, lineIndex, lines, call, engine])

  useEffect(() => {
    if (phase === 'arrive' || phase === 'outcome' || phase === 'ending') engine.cancelSpeech()
  }, [phase, engine])

  const start = useCallback(async () => {
    await engine.start()
    engine.beep(660, 0.08, 0.05)
    setPhase('briefing')
  }, [engine])

  const resetRun = useCallback(() => {
    setCallIndex(0)
    setLineIndex(0)
    setMessUps(0)
    setChoice(null)
    setAction(null)
    setActionIndex(0)
    setResult(null)
    setHistory([])
    setEnding(null)
  }, [])

  const clockIn = useCallback(() => {
    resetRun()
    engine.beep(520, 0.07, 0.05)
    setPhase('drive')
  }, [resetRun, engine])

  const answer = useCallback(() => {
    if (phase !== 'drive') return
    engine.connectCall()
    setLineIndex(0)
    setPhase('call')
  }, [phase, engine])

  const skip = useCallback(() => {
    if (phase !== 'call') return
    engine.cancelSpeech()
    if (lineIndex >= lines.length - 1) {
      setPhase('arrive')
      return
    }
    setLineIndex((i) => Math.min(i + 1, lines.length - 1))
  }, [phase, lineIndex, lines.length, engine])

  const resolve = useCallback(
    (kind, act) => {
      const c = NIGHT.calls[callIndex]
      let good = false
      let resultLines = []
      let consequence = null
      let fatal = false
      let radio = null

      if (kind === 'enter') {
        const a = act || c.enter.actions[0]
        resultLines = a.result
        fatal = !!a.fatal
        good = c.right === 'enter' && !!a.correct && !fatal
        consequence = good ? null : a.consequence || null
      } else {
        resultLines = c.disclose.result
        radio = c.disclose.radio
        good = c.right === 'disclose'
        consequence = good ? null : c.disclose.consequence || null
      }

      const nextMess = good ? messUps : Math.min(MAX_MESS_UPS, messUps + 1)
      setMessUps(nextMess)
      setResult({ good, lines: resultLines, consequence, fatal, kind, radio })
      setHistory((h) => [
        ...h,
        { id: c.id, address: c.address, caller: c.caller, good },
      ])
      setPhase('outcome')
      engine.cancelSpeech()

      if (good) engine.correct()
      else engine.wrong()

      if (fatal) setEnding('door')
      else if (nextMess >= MAX_MESS_UPS) setEnding('breach')
      else if (callIndex + 1 >= NIGHT.calls.length) setEnding('dawn')
    },
    [callIndex, messUps, engine],
  )

  const chooseApproach = useCallback(
    (kind) => {
      if (phase !== 'arrive') return
      setChoice(kind)
      if (kind === 'enter') {
        setActionIndex(0)
        setPhase('cutscene')
        engine.knock()
      } else {
        resolve('disclose', null)
      }
    },
    [phase, engine, resolve],
  )

  const chooseAction = useCallback(
    (act) => {
      if (phase !== 'cutscene') return
      setAction(act)
      resolve('enter', act)
    },
    [phase, resolve],
  )

  const advance = useCallback(() => {
    if (phase !== 'outcome') return
    if (ending) {
      setPhase('ending')
      return
    }
    setCallIndex((i) => i + 1)
    setLineIndex(0)
    setChoice(null)
    setAction(null)
    setActionIndex(0)
    setResult(null)
    setPhase('drive')
  }, [phase, ending])

  const restart = useCallback(() => {
    resetRun()
    setPhase('drive')
  }, [resetRun])

  const toTitle = useCallback(() => {
    engine.cancelSpeech()
    resetRun()
    setPhase('title')
  }, [engine, resetRun])

  return {
    phase,
    call,
    callIndex,
    lines,
    lineIndex,
    currentLine,
    messUps,
    interference,
    choice,
    action,
    actionIndex,
    setActionIndex,
    result,
    history,
    ending,
    muted,
    setMuted,
    start,
    clockIn,
    answer,
    skip,
    chooseApproach,
    chooseAction,
    advance,
    restart,
    toTitle,
    total: NIGHT.calls.length,
    endingData: ending ? NIGHT.endings[ending] : null,
  }
}
