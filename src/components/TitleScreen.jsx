export default function TitleScreen({ onStart }) {
  return (
    <div className="screen title-screen">
      <div className="title-screen__inner">
        <div className="title-screen__kicker">
          <span className="rec-dot" /> KSEV 1180 · COUNTY EMERGENCY DISPATCH
        </div>

        <h1 className="title-screen__title">
          DEAD<span>AIR</span>
        </h1>

        <p className="title-screen__tagline">
          A blizzard. A relay tower. Six callers describing the same thing.
        </p>

        <p className="title-screen__lede">
          You work the graveyard shift at Kettle Ridge Relay. The plow convoy is stuck at
          the pass. Every call tonight routes to you — panicked voices, a county map, and
          a board of protocols that stopped making sense an hour ago.
        </p>

        <ul className="title-screen__rules">
          <li>
            <b>Listen.</b> Callers describe where they are and what is outside.
          </li>
          <li>
            <b>Cross-reference.</b> Road status, closures and protocol are on the board.
          </li>
          <li>
            <b>Send help.</b> One instruction per call. You will not see the outcome.
          </li>
        </ul>

        <button className="btn btn--primary btn--wide" onClick={onStart} type="button">
          Begin shift
        </button>

        <p className="title-screen__foot">
          Headphones recommended · Best played in the dark · Contains sudden noise
        </p>
      </div>
      <div className="title-screen__aside">
        <div className="title-screen__stamp">02:14 AM</div>
        <div className="title-screen__weather">
          <span>WIND</span> 48 MPH NW
          <span>VIS</span> 0.1 MI
          <span>TEMP</span> −17 °F
        </div>
      </div>
    </div>
  )
}
