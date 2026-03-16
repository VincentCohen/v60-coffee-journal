import styles from './EntryCard.module.css'

export default function EntryCard({ entry, onDelete }) {
  const { bean, roaster, roast, dose, water, temp, drawdown,
          acidity, sweetness, body, bitterness, flavors, rating, notes, date } = entry

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.bean}>{bean}</h2>
          <p className={styles.sub}>{date}{roaster ? ` · ${roaster}` : ''}</p>
        </div>
        <div className={styles.headerRight}>
          {rating > 0 && (
            <div className={styles.stars}>
              {'★'.repeat(rating)}<span className={styles.emptyStars}>{'★'.repeat(5-rating)}</span>
            </div>
          )}
          <button className={styles.del} onClick={() => onDelete(entry.id)} aria-label="Delete">✕</button>
        </div>
      </header>

      <div className={styles.tags}>
        {dose     && <span className={styles.tag}>{dose} g</span>}
        {water    && <span className={styles.tag}>{water} g water</span>}
        {entry.grinder      && <span className={styles.tag}>{entry.grinder}</span>}
        {entry.grindSetting && <span className={styles.tag}>⚙ {entry.grindSetting}</span>}
        {temp     && <span className={styles.tag}>{temp} °C</span>}
        {drawdown && <span className={styles.tag}>{drawdown}</span>}
        {roast    && <span className={styles.tag}>{roast}</span>}
      </div>

      {flavors?.length > 0 && (
        <div className={styles.flavors}>
          {flavors.map(f => <span key={f} className={styles.flavor}>{f}</span>)}
        </div>
      )}

      <div className={styles.bars}>
        {[['Acidity',acidity],['Sweetness',sweetness],['Body',body],['Bitterness',bitterness]].map(([l,v]) => (
          <div key={l} className={styles.barRow}>
            <span className={styles.barLbl}>{l}</span>
            <div className={styles.track}><div className={styles.fill} style={{ width: `${v*10}%` }} /></div>
            <span className={styles.barVal}>{v}</span>
          </div>
        ))}
      </div>

      {notes && <blockquote className={styles.notes}>"{notes}"</blockquote>}
    </article>
  )
}
