import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioEngine } from './audio/engine'
import { useNight } from './game/useNight'
import Screen from './components/Screen'
import TitleScreen from './components/TitleScreen'
import Briefing from './components/Briefing'
import HUD from './components/HUD'
import DriveView from './components/DriveView'
import SceneView from './components/SceneView'
import CallPanel from './components/CallPanel'
import ArrivePanel from './components/ArrivePanel'
import Cutscene from './components/Cutscene'
import OutcomePanel from './components/OutcomePanel'
import EndingScreen from './components/EndingScreen'

export default function App() {
  const engineRef = useRef(null)
  if (!engineRef.current) engineRef.current = new AudioEngine()
  const engine = engineRef.current

  const [voice, setVoice] = useState({ status: 'idle', progress: 0 })

  useEffect(() => {
    engine.onVoiceStatus = setVoice
    engine.initVoices()
    return () => {
      engine.onVoiceStatus = null
    }
  }, [engine])

  const game = useNight(engine)
  const {
    phase,
    call,
    callIndex,
    lines,
    lineIndex,
    messUps,
    interference,
    actionIndex,
    setActionIndex,
    result,
    history,
    ending,
    endingData,
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
    total,
  } = game

  const toggleMute = useCallback(() => {
    setMuted((m) => !m)
  }, [setMuted])

  const pressA = useCallback(() => {
    engine.beep(880, 0.04, 0.035)
    if (phase === 'title') start()
    else if (phase === 'briefing') clockIn()
    else if (phase === 'drive') answer()
    else if (phase === 'call') skip()
    else if (phase === 'arrive') chooseApproach('enter')
    else if (phase === 'cutscene') chooseAction(call.enter.actions[actionIndex])
    else if (phase === 'outcome') advance()
    else if (phase === 'ending') restart()
  }, [
    engine,
    phase,
    start,
    clockIn,
    answer,
    skip,
    chooseApproach,
    chooseAction,
    call,
    actionIndex,
    advance,
    restart,
  ])

  const pressB = useCallback(() => {
    engine.beep(440, 0.05, 0.03)
    if (phase === 'arrive') chooseApproach('disclose')
    else if (phase === 'ending') toTitle()
  }, [engine, phase, chooseApproach, toTitle])

  const pressUp = useCallback(() => {
    if (phase !== 'cutscene') return
    engine.beep(720, 0.03, 0.025)
    setActionIndex((i) => Math.max(0, i - 1))
  }, [phase, engine, setActionIndex])

  const pressDown = useCallback(() => {
    if (phase !== 'cutscene') return
    engine.beep(600, 0.03, 0.025)
    setActionIndex((i) => Math.min((call?.enter.actions.length || 1) - 1, i + 1))
  }, [phase, engine, call, setActionIndex])

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return
      const k = e.key
      if (k === 'ArrowUp') {
        e.preventDefault()
        pressUp()
      } else if (k === 'ArrowDown') {
        e.preventDefault()
        pressDown()
      } else if (k === 'Enter' || k === ' ' || k === 'z' || k === 'Z') {
        e.preventDefault()
        pressA()
      } else if (k === 'x' || k === 'X' || k === 'Escape') {
        e.preventDefault()
        pressB()
      } else if (k === 'm' || k === 'M') {
        toggleMute()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pressA, pressB, pressUp, pressDown, toggleMute])

  let screen = null

  if (phase === 'title') {
    screen = (
      <TitleScreen
        voiceStatus={voice.status}
        voiceProgress={voice.progress}
        onStart={start}
      />
    )
  } else if (phase === 'briefing') {
    screen = <Briefing onClockIn={clockIn} />
  } else if (phase === 'drive' && call) {
    screen = (
      <div className="scr scr--play">
        <DriveView speed={1} tension={interference / 100} />
        <HUD
          clock={call.clock}
          callIndex={callIndex}
          total={total}
          address={call.address}
          interference={interference}
          messUps={messUps}
          muted={muted}
        />
        <div className="dial">
          <div className="dial__head">
            <span className="blink">●</span> DIALING
          </div>
          <div className="dial__addr">{call.address}</div>
          <button type="button" className="dial__btn" onClick={answer}>
            CALL ▸
          </button>
          <div className="dial__hint">A / D LOOK · KEEP YOUR EYES ON THE ROAD</div>
        </div>
      </div>
    )
  } else if (phase === 'call' && call) {
    screen = (
      <div className="scr scr--play">
        <DriveView speed={0.8} tension={interference / 100} />
        <HUD
          clock={call.clock}
          callIndex={callIndex}
          total={total}
          address={call.address}
          interference={interference}
          messUps={messUps}
          muted={muted}
        />
        <CallPanel call={call} lines={lines} lineIndex={lineIndex} onSkip={skip} />
      </div>
    )
  } else if (phase === 'arrive' && call) {
    screen = (
      <div className="scr scr--play">
        <DriveView arrived speed={0} tension={interference / 100} />
        <HUD
          clock={call.clock}
          callIndex={callIndex}
          total={total}
          address={call.address}
          interference={interference}
          messUps={messUps}
          muted={muted}
        />
        <ArrivePanel
          call={call}
          onEnter={() => chooseApproach('enter')}
          onDisclose={() => chooseApproach('disclose')}
        />
      </div>
    )
  } else if (phase === 'cutscene' && call) {
    screen = (
      <div className="scr scr--scene">
        <SceneView kind={call.enter.scene} danger={interference > 55} />
        <Cutscene
          intro={call.enter.intro}
          actions={call.enter.actions}
          actionIndex={actionIndex}
          onSelect={setActionIndex}
          onAct={chooseAction}
        />
      </div>
    )
  } else if (phase === 'outcome' && result && call) {
    screen = (
      <div className="scr scr--scene">
        <SceneView
          kind={result.kind === 'enter' ? call.enter.scene : 'car'}
          danger={!result.good}
        />
        <OutcomePanel result={result} onContinue={advance} />
      </div>
    )
  } else if (phase === 'ending' && endingData) {
    screen = (
      <div className="scr scr--scene">
        <SceneView kind={endingData.scene} danger={ending !== 'dawn'} />
        <EndingScreen
          data={endingData}
          history={history}
          messUps={messUps}
          total={total}
          onRestart={restart}
          onTitle={toTitle}
        />
      </div>
    )
  }

  return (
    <div className="app" onPointerDown={() => engine.beep(1200, 0.03, 0.02)}>
      <Screen muted={muted} onToggleMute={toggleMute}>
        {screen}
      </Screen>
      <p className="app__hint">TAP OR CLICK · ENTER = CONTINUE · ↑↓ CHOOSE · M = SOUND</p>
    </div>
  )
}
