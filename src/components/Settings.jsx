import styles from './Settings.module.css'

export default function Settings({ user, theme, onCycleTheme, onSignOut }) {
  const themeLabel = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'
  const themeIcon  = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⚙️'
  const nextLabel  = theme === 'system' ? 'Light' : theme === 'light' ? 'Dark' : 'System'

  return (
    <div className={styles.wrap}>
      <div className={styles.phaseHeader}>
        <h2 className={styles.phaseTitle}>Settings</h2>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Account</p>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.rowIcon}>👤</span>
            <span className={styles.rowText}>{user?.email}</span>
          </div>
          <div className={styles.divider} />
          <button className={styles.row} onClick={onSignOut}>
            <span className={styles.rowIcon}>👋</span>
            <span className={styles.rowText}>Sign out</span>
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Appearance</p>
        <div className={styles.card}>
          <button className={styles.row} onClick={onCycleTheme}>
            <span className={styles.rowIcon}>{themeIcon}</span>
            <div className={styles.rowContent}>
              <span className={styles.rowText}>Theme</span>
              <span className={styles.rowValue}>{themeLabel} → {nextLabel}</span>
            </div>
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>About</p>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.rowIcon}>☕</span>
            <div className={styles.rowContent}>
              <span className={styles.rowText}>JustPoured</span>
              <span className={styles.rowValue}>justpoured.app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
