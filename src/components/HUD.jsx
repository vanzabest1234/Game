const VOICE_LABEL = {
  idle: 'VOICE · OFF',
  loading: 'VOICE · LOADING',
  ready: 'VOICE · NEURAL',
  error: 'VOICE · FALLBACK',
}

export default function HUD({
  clock,
  tension,
  callIndex,
  total,
  muted,
  setMuted,
  voiceStatus,
  voiceProgress,
}) {
  const level = tension >= 70 ? 'high' : tension >= 40 ? 'mid' : 'low'
  return (
    <header className="hud">
      <div className="hud__brand">
        <span className="rec-dot" />
        <span className="hud__brand-main">KSEV</span>
        <span className="hud__brand-sub">KETTLE RIDGE RELAY</span>
      </div>

      <div className="hud__clock">
        <span className="hud__clock-time">{clock}</span>
        <span className="hud__clock-label">LOCAL</span>
      </div>

      <div className="hud__meter" data-level={level}>
        <span className="hud__meter-label">INTERFERENCE</span>
        <div className="meter" role="img" aria-label={`Interference ${tension} percent`}>
          <div className="meter__fill" style={{ width: `${tension}%` }} />
        </div>
        <span className="hud__meter-value">{String(tension).padStart(2, '0')}</span>
      </div>

      <div className="hud__shift">
        CALL <b>{String(Math.min(callIndex + 1, total)).padStart(2, '0')}</b> /{' '}
        {String(total).padStart(2, '0')}
      </div>

      <span className="hud__voice" data-voice-status={voiceStatus}>
        {voiceStatus === 'loading'
          ? `${VOICE_LABEL.loading} ${voiceProgress}%`
          : VOICE_LABEL[voiceStatus] || VOICE_LABEL.idle}
      </span>

      <button
        type="button"
        className="hud__mute"
        onClick={() => setMuted(!muted)}
        aria-pressed={muted}
      >
        {muted ? 'SOUND OFF' : 'SOUND ON'}
      </button>
    </header>
  )
}
