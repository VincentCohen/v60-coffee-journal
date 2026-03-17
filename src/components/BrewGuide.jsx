import styles from './BrewGuide.module.css'

const STEPS = [
  { time: '0:00', duration: '45s', label: 'Bloom', detail: 'Pour 50 g — slow spiral from centre, saturate all grounds. Wait for bloom to subside.' },
  { time: '0:45', duration: '45s', label: 'First pour', detail: 'Pour steadily to 150 g — gentle continuous spiral, working outward.' },
  { time: '1:30', duration: '60s', label: 'Second pour', detail: 'Pour to 250 g — slow and steady to finish. Don\'t agitate the bed.' },
  { time: '2:30', duration: '~90s', label: 'Drawdown', detail: 'Swirl the dripper gently to level the bed, then wait for full drawdown.' },
  { time: '4:00', duration: '', label: 'Done', detail: 'Total brew time ~4 minutes. Remove dripper and enjoy.' },
]

export default function BrewGuide() {
  return (
    <div className={styles.guide}>
      <div className={styles.ratioCard}>
        <div className={styles.ratioItem}>
          <span className={styles.ratioVal}>15 g</span>
          <span className={styles.ratioLbl}>Coffee</span>
        </div>
        <div className={styles.ratioDivider}>:</div>
        <div className={styles.ratioItem}>
          <span className={styles.ratioVal}>250 g</span>
          <span className={styles.ratioLbl}>Water</span>
        </div>
        <div className={styles.ratioDivider}>@</div>
        <div className={styles.ratioItem}>
          <span className={styles.ratioVal}>92–96°C</span>
          <span className={styles.ratioLbl}>Temp</span>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Steps</h2>
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepTime}>
                <span className={styles.stepAt}>{s.time}</span>
                {s.duration && <span className={styles.stepDur}>{s.duration}</span>}
              </div>
              <div className={styles.stepBody}>
                <span className={styles.stepLabel}>{s.label}</span>
                <p className={styles.stepDetail}>{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Grind guide</h2>
        <p className={styles.grindNote}>Medium-fine. On a Comandante C40, start around 24–26 clicks. Adjust: if drawdown is under 3:30, go coarser. If over 4:30, go finer.</p>
      </div>
    </div>
  )
}