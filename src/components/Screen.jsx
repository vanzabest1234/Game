export default function Screen({ children, muted = false, onToggleMute }) {
  return (
    <div className="lcd">
      <div className="lcd__status">
        <span className="lcd__live">
          <i aria-hidden="true" /> ON AIR
        </span>
        <span className="lcd__station">KETTLE COUNTY NIGHT DESK</span>
        <button type="button" className="lcd__sound" onClick={onToggleMute}>
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
      </div>

      <div className="lcd__frame">
        <div className="lcd__screen">
          <div className="lcd__inner">{children}</div>
          <div className="lcd__dots" aria-hidden="true" />
          <div className="lcd__glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
