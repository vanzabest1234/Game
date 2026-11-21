import DriveView from './DriveView'

export default function TitleScreen({ voiceStatus = 'idle', voiceProgress = 0, onStart }) {
  return (
    <div className="scr scr--title">
      <DriveView title speed={0.45} />
      <div className="title__overlay">
        <div className="title__kicker">KETTLE COUNTY · NIGHT DESK</div>
        <h1 className="title__logo">
          DEAD
          <span>AIR</span>
        </h1>
        <div className="title__rule" aria-hidden="true" />
        <p className="title__tag">A NIGHT SHIFT DRIVING GAME</p>
        <p className="title__blurb">
          One car. One county. Five addresses. You call them from the road — then decide
          whether to go in.
        </p>
        <button type="button" className="title__press blink" onClick={onStart}>
          TAP TO DRIVE
        </button>
        <p className="title__voice" data-voice-status={voiceStatus}>
          {voiceStatus === 'loading' && `VOICE ${voiceProgress}%`}
          {voiceStatus === 'ready' && 'VOICE READY'}
          {voiceStatus === 'error' && 'VOICE FALLBACK'}
          {voiceStatus === 'idle' && 'HEADPHONES ON'}
        </p>
      </div>
    </div>
  )
}
