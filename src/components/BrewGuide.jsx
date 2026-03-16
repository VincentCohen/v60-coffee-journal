import styles from './BrewGuide.module.css'

const STEPS = [
  { title: 'Rinse filter', detail: 'Rinse the paper filter with hot water and discard. Preheats the dripper and removes papery taste.' },
  { title: 'Add coffee & create a well', detail: 'Add 15 g of medium-fine ground coffee. Shake to level, then press a small well in the centre.' },
  { title: 'Bloom — 0:00 to 0:45', detail: 'Pour 50 g in a slow spiral, saturating all grounds. Wait until 0:45.' },
  { title: 'First pour — 0:45 to 1:30', detail: 'Pour steadily up to 150 g total. Gentle continuous spiral, keep the level consistent.' },
  { title: 'Second pour — 1:30 to 2:30', detail: 'Pour to 250 g total. Aim to finish by 2:00. Slow and steady.' },
  { title: 'Swirl & drawdown', detail: 'Gentle swirl to flatten the bed. Drawdown should finish 3:30–4:00. Faster → finer grind. Slower → coarser.' },
]

export default function BrewGuide() {
  return (
    <div className={styles.guide}>
      <div className={styles.hero}>
        <div className={styles.heroGrid}>
          {[['Coffee','15 g'],['Water','250 g'],['Ratio','1:16.7'],['Temp','92–96 °C']].map(([l,v]) => (
            <div key={l} className={styles.heroItem}>
              <span className={styles.heroLabel}>{l}</span>
              <span className={styles.heroVal}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Method</p>
        <ol className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.num}>{i + 1}</span>
              <div>
                <strong className={styles.stepTitle}>{s.title}</strong>
                <p className={styles.stepDetail}>{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Grind guide</p>
        <div className={styles.grindScale}>
          {['Espresso','V60','Chemex','French press'].map(l => (
            <div key={l} className={`${styles.grindItem} ${l === 'V60' ? styles.grindActive : ''}`}>
              <div className={styles.grindDot} />
              <span>{l}</span>
            </div>
          ))}
          <div className={styles.grindLine} />
        </div>
        <p className={styles.grindNote}>
          Medium-fine — a little coarser than espresso. Adjust by drawdown time.
        </p>
      </div>
    </div>
  )
}
