import { useEffect, useRef, useState } from 'react'
import { AudioEngine } from './audio/engine'
import { useGame } from './game/useGame'
import TitleScreen from './components/TitleScreen'
import Briefing from './components/Briefing'
import HUD from './components/HUD'
import RadioConsole from './components/RadioConsole'
import CountyMap from './components/CountyMap'
import DispatchPanel from './components/DispatchPanel'
import Bulletin from './components/Bulletin'
import CallLog from './components/CallLog'
import EndingScreen from './components/EndingScreen'

export default function App() {
  const engineRef = useRef(null)
  if (!engineRef.current) engineRef.current = new AudioEngine()
  const engine = engineRef.current

  const [voice, setVoice] = useState({ status: 'idle', progress: 0 })
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    engine.onVoiceStatus = setVoice
    engine.onVoiceActivity = setSpeaking
    engine.initVoices()
    return () => {
      engine.onVoiceStatus = null
      engine.onVoiceActivity = null
    }
  }, [engine])

  const game = useGame(engine)
  const {
    phase,
    call,
    callIndex,
    lines,
    lineIndex,
    tension,
    chosen,
    history,
    bulletinExtra,
    endingData,
    muted,
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
    total,
  } = game

  const level = tension >= 70 ? 'high' : tension >= 40 ? 'mid' : 'low'
  const clock = phase === 'title' || phase === 'briefing' ? '02:14' : call?.clock || '02:14'
  const inGame = ['incoming', 'call', 'dispatch', 'outcome'].includes(phase)

  return (
    <div className="app" data-tension={level}>
      <div className="fx" aria-hidden="true">
        <div className="fx__grain" />
        <div className="fx__vignette" />
        <div className="fx__scanlines" />
      </div>

      {phase === 'title' && (
        <TitleScreen onStart={start} voiceStatus={voice.status} voiceProgress={voice.progress} />
      )}
      {phase === 'briefing' && <Briefing onClockIn={clockIn} />}

      {inGame && (
        <div className="board">
          <HUD
            clock={clock}
            tension={tension}
            callIndex={callIndex}
            total={total}
            muted={muted}
            setMuted={setMuted}
            voiceStatus={voice.status}
            voiceProgress={voice.progress}
          />

          <main className="board__grid">
            <RadioConsole
              phase={phase}
              call={call}
              lines={lines}
              lineIndex={lineIndex}
              tension={tension}
              onAnswer={answer}
              onSkip={skip}
              onRewind={rewind}
              speaking={speaking}
            />

            <div className="board__col">
              <CountyMap marker={call?.marker} tension={tension} phase={phase} />
              <Bulletin extra={bulletinExtra} />
            </div>

            <div className="board__col">
              <DispatchPanel
                phase={phase}
                call={call}
                chosen={chosen}
                onChoose={choose}
                onAdvance={advance}
                ending={game.ending}
              />
              <CallLog history={history} />
            </div>
          </main>

          <footer className="ticker">
            <span className="ticker__badge">COUNTY ALERT</span>
            <span className="ticker__text">
              BLIZZARD WARNING IN EFFECT UNTIL 06:00 · ALL PLOW OPERATIONS SUSPENDED ·
              SHELTER IN PLACE · REPORT LIGHTS IN THE TREELINE TO DISPATCH
            </span>
          </footer>
        </div>
      )}

      {phase === 'ending' && endingData && (
        <EndingScreen
          data={endingData}
          history={history}
          onRestart={restart}
          onTitle={toTitle}
        />
      )}
    </div>
  )
}
