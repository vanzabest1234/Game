import { BULLETIN } from '../game/calls'

export default function Bulletin({ extra = [] }) {
  return (
    <section className="panel bulletin" aria-label="County bulletin">
      <div className="panel__head">
        <span className="panel__title">COUNTY BOARD</span>
        <span className="panel__meta">PINNED</span>
      </div>
      <div className="bulletin__list">
        {BULLETIN.map((b) => (
          <article key={b.head} className="bulletin__item">
            <h3>{b.head}</h3>
            <p>{b.body}</p>
          </article>
        ))}
        {extra.map((b, i) => (
          <article key={`x${i}`} className="bulletin__item bulletin__item--new">
            <h3>{b.head}</h3>
            <p>{b.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
