import { MAX_MESS_UPS } from '../game/night'

export default function HUD({ clock, callIndex, total, address, interference, messUps, muted }) {
  const bars = Math.round(interference / 20)
  return (
    <div className="hud">
      <div className="hud__row">
        <span className="hud__clock">{clock}</span>
        <span className="hud__call">
          ADDR {String(callIndex + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
        <span className="hud__sound">{muted ? 'SND OFF' : 'SND ON'}</span>
      </div>

      <div className="hud__addr">{address}</div>

      <div className="hud__row hud__row--bottom">
        <span className="hud__mess">
          MESS
          <span className="hud__pips">
            {Array.from({ length: MAX_MESS_UPS }).map((_, i) => (
              <i key={i} className={i < messUps ? 'is-on' : ''} />
            ))}
          </span>
        </span>
        <span className="hud__sig">
          SIG
          <span className="hud__bars">
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} className={i < bars ? 'is-on' : ''} />
            ))}
          </span>
        </span>
      </div>
    </div>
  )
}
