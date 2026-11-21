import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CALLS, ENDINGS } from './calls'

const lineMs = (text) => Math.min(8200, 2000 + text.length * 38)
const RING_MS = 6200

export function useGame(engine) {
  const [phase, setPhase] = useState('title')
  const [callIndex, setCallIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [tension, setTension] = useState(9)
  const [chosen, setChosen] = useState(null)
  const [history, setHistory] = useState([])
  const [pending, setPending] = useState([])
  const [bulletinExtra, setBulletinExtra] = useState([])
  const [ending, setEnding] = useState(null)
  const [muted, setMuted] = useState(false)
  const [shiftOpen, setShiftOpen] = useState(false)
  const [answered, setAnswered] = useState(false)

  const call = CALLS[callIndex]
  const speakingRef = useRef(false)

  const lines = useMemo(() => {
    if (!call) return []
    const background = pending.map((text) => ({ t: text, fx: 'static', radio: true }))
    return [...background, ...call.lines]
  }, [call, pending, callIndex])

  const currentLine = lines[lineIndex] || null

  // Interference drives the mix.
  useEffect(() => {
    engine.setTension(tension / 100)
  }, [tension, engine])

  useEffect(() => {
    engine.setMuted(muted)
  }, [muted, engine])

  // Generate the call's lines ahead of playback so the voice keeps up.
  useEffect(() => {
    if (!call) return
    engine.prepareLines(
      lines.filter((line) => !line.radio).map((line) => line.t),
      call.voice,
    )
  }, [call, lines, engine])

  // Ringing, then auto-connect so the night keeps moving.
  useEffect(() => {
    if (phase !== 'incoming') return
    engine.ring()
    const t = setTimeout(() => {
      setAnswered(true)
      setPhase('call')
      setLineIndex(0)
      engine.connectCall()
    }, RING_MS)
    return () => clearTimeout(t)
  }, [phase, callIndex, engine])

  // Play the transcript: one line at a time, spoken and paced.
  useEffect(() => {
    if (phase !== 'call') return
    const line = lines[lineIndex]
    if (!line) {
      // Never wedge a call if the transcript index overruns (fast skipping).
      setPhase('dispatch')
      return
    }
    if (line.fx === 'static') engine.burst(0.45, 0.2)
    if (!line.radio) engine.speak(line.t, call.voice)

    if (lineIndex >= lines.length - 1) {
      const t = setTimeout(() => {
        engine.cancelSpeech()
        setPhase('dispatch')
      }, 1500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setLineIndex((i) => i + 1), lineMs(line.t))
    return () => clearTimeout(t)
  }, [phase, lineIndex, callIndex, lines, call, engine])

  // Leaving a call kills any queued speech.
  useEffect(() => {
    if (phase === 'dispatch' || phase === 'outcome' || phase === 'ending') {
      engine.cancelSpeech()
    }
  }, [phase, engine])

  const start = useCallback(async () => {
    await engine.start()
    engine.burst(0.5, 0.18)
    setPhase('briefing')
  }, [engine])

  const clockIn = useCallback(() => {
    setShiftOpen(true)
    setPhase('incoming')
    setCallIndex(0)
    setLineIndex(0)
    setAnswered(false)
  }, [])

  const answer = useCallback(() => {
    if (phase !== 'incoming') return
    engine.connectCall()
    setAnswered(true)
    setLineIndex(0)
    setPhase('call')
  }, [phase, engine])

  const skip = useCallback(() => {
    if (phase !== 'call') return
    engine.cancelSpeech()
    if (lineIndex >= lines.length - 1) {
      setPhase('dispatch')
      return
    }
    setLineIndex((i) => Math.min(i + 1, lines.length - 1))
  }, [phase, lineIndex, lines.length, engine])

  const rewind = useCallback(() => {
    if (phase !== 'dispatch') return
    setLineIndex(0)
    setPhase('call')
  }, [phase])

  const choose = useCallback(
    (option) => {
      if (phase !== 'dispatch') return
      const wrong = !option.correct
      const nextTension = Math.max(6, Math.min(100, tension + (wrong ? 30 : -4)))
      setTension(nextTension)
      setChosen(option)
      setPhase('outcome')
      engine.cancelSpeech()

      if (wrong) {
        engine.wrong()
        if (option.consequence) {
          setPending((p) => [...p, option.consequence])
          setBulletinExtra((b) => [...b, { head: `LOG · ${call.clock}`, body: option.consequence, bad: true }])
        }
      } else {
        engine.correct()
      }

      setHistory((h) => [
        ...h,
        {
          id: call.id,
          clock: call.clock,
          caller: call.caller,
          channel: call.channel,
          correct: !!option.correct,
          status: option.correct ? 'RESOLVED' : option.lost || 'LOST',
        },
      ])

      const breached = nextTension >= 100
      if (option.fatal) {
        setEnding(call.id === 'door' ? 'door' : 'breach')
      } else if (breached) {
        setEnding('breach')
      }
    },
    [phase, tension, call, engine],
  )

  const advance = useCallback(() => {
    if (phase !== 'outcome') return
    if (ending) {
      setPhase('ending')
      return
    }
    if (callIndex + 1 >= CALLS.length) {
      setEnding('dawn')
      setPhase('ending')
      return
    }
    setCallIndex((i) => i + 1)
    setLineIndex(0)
    setChosen(null)
    setAnswered(false)
    setPhase('incoming')
  }, [phase, ending, callIndex])

  const restart = useCallback(() => {
    setPhase('incoming')
    setCallIndex(0)
    setLineIndex(0)
    setTension(9)
    setChosen(null)
    setHistory([])
    setPending([])
    setBulletinExtra([])
    setEnding(null)
    setAnswered(false)
    setShiftOpen(true)
  }, [])

  const toTitle = useCallback(() => {
    engine.cancelSpeech()
    setPhase('title')
    setEnding(null)
    setChosen(null)
    setHistory([])
    setPending([])
    setBulletinExtra([])
    setTension(9)
    setCallIndex(0)
    setLineIndex(0)
    setShiftOpen(false)
  }, [engine])

  return {
    phase,
    call,
    callIndex,
    lines,
    lineIndex,
    currentLine,
    tension,
    chosen,
    history,
    bulletinExtra,
    ending,
    muted,
    shiftOpen,
    answered,
    setMuted,
    start,
    clockIn,
    answer,
    skip,
    rewind,
    choose,
    advance,
    restart,
    toTitle,
    endingData: ending ? ENDINGS[ending] : null,
    total: CALLS.length,
  }
}
