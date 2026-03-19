import styles from './BrewGuide.module.css'

const STEPS = [
  { time: '0:00–0:45', label: 'Bloom', detail: 'Pour 50 g in a slow spiral, saturating all grounds. Wait until 0:45.' },
  { time: '0:45–1:30', label: 'First pour', detail: 'Pour steadily up to 150 g total. Gentle continuous spiral, keep the level consistent.' },
  { time: '1:30–2:30', label: 'Second pour', detail: 'Pour to 250 g total. Aim to finish by 2:00. Slow and steady.' },
  { time: '2:30–4:00', label: 'Swirl & drawdown', detail: 'Gentle swirl to flatten the bed. Drawdown should finish 3:30–4:00. Faster → finer grind. Slower → coarser.' },
]

const GRIND = [
  { label: 'Espresso' },
  { label: 'V60', active: true },
  { label: 'Chemex' },
  { label: 'French press' },
]

export default function BrewGuide() {
  return (
    <div className={styles.guide}>

      <div className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <span className={styles.heroLabel}>Coffee</span>
            <span className={styles.heroVal}>15 g</span>
          </div>
          <div>
            <span className={styles.heroLabel}>Water</span>
            <span className={styles.heroVal}>250 g</span>
          </div>
          <div>
            <span className={styles.heroLabel}>Ratio</span>
            <span className={styles.heroVal}>1:16.7</span>
          </div>
          <div>
            <span className={styles.heroLabel}>Temp</span>
            <span className={styles.heroVal}>92–96 °C</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Method</p>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepBody}>
                <span className={styles.stepTitle}>{s.label} — {s.time}</span>
                <span className={styles.stepDetail}>{s.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.cardLabel}>Grind guide</p>
        <div className={styles.grindScale}>
          <div className={styles.grindLine} />
          {GRIND.map((g, i) => (
            <div key={i} className={`${styles.grindItem} ${g.active ? styles.grindActive : ''}`}>
              <div className={styles.grindDot} />
              <span>{g.label}</span>
            </div>
          ))}
        </div>
        <p className={styles.grindNote}>Medium-fine — a little coarser than espresso. Adjust by drawdown time.</p>
      </div>

    </div>
  )
}