export default function ArrivePanel({ call, onEnter, onDisclose }) {
  return (
    <div className="arrive">
      <div className="arrive__addr">ARRIVED · {call.address}</div>
      <p className="arrive__prompt">{call.arrive}</p>
      <div className="arrive__opts">
        <button type="button" className="opt opt--a" onClick={onEnter}>
          <span className="opt__key">A</span>
          <span className="opt__body">
            <b>GO IN</b>
            <em>Leave the car. Handle it.</em>
          </span>
        </button>
        <button type="button" className="opt opt--b" onClick={onDisclose}>
          <span className="opt__key">B</span>
          <span className="opt__body">
            <b>DISCLOSE</b>
            <em>Stay in the car. Radio it in.</em>
          </span>
        </button>
      </div>
      <div className="arrive__hint">THERE IS NO THIRD OPTION</div>
    </div>
  )
}
