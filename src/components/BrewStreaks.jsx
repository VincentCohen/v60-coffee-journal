import styles from './BrewStreaks.module.css'

// Parse "12 Mar 2025" → "2025-03-12"
function parseEntryDate(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  return d.toISOString().slice(0, 10)
}

function toYMD(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(ymd, n) {
  const d = new Date(ymd)
  d.setDate(d.getDate() + n)
  return toYMD(d)
}

function diffDays(a, b) {
  // days from a to b (b - a)
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

function computeStreaks(entries) {
  // unique brew days, sorted ascending
  const days = [...new Set(
    entries.map(e => parseEntryDate(e.date)).filter(Boolean)
  )].sort()

  if (!days.length) return { current: 0, longest: 0, streaks: [], brewDays: new Set() }

  const brewSet = new Set(days)
  const today = toYMD(new Date())

  // Build streak list — walk through sorted days, merge with grace rule
  const streaks = [] // [{ start, end, length }]
  let start = days[0]
  let end   = days[0]

  for (let i = 1; i < days.length; i++) {
    const gap = diffDays(days[i - 1], days[i])
    if (gap <= 2) {
      // gap of 1 = consecutive, gap of 2 = one grace day — both continue the streak
      end = days[i]
    } else {
      streaks.push({ start, end })
      start = days[i]
      end   = days[i]
    }
  }
  streaks.push({ start, end })

  // Compute streak lengths (count actual brew days in range, not calendar days)
  const withLengths = streaks.map(s => {
    const len = days.filter(d => d >= s.start && d <= s.end).length
    return { ...s, length: len }
  })

  // Current streak — is the last streak still active? (end is today or yesterday or grace)
  const last = withLengths[withLengths.length - 1]
  const gapFromToday = diffDays(last.end, today)
  const current = gapFromToday <= 2 ? last.length : 0

  const longest = Math.max(...withLengths.map(s => s.length))

  // Past streaks = all except current (if active), reversed
  const past = current > 0
    ? withLengths.slice(0, -1).reverse()
    : withLengths.slice().reverse()

  return { current, longest, streaks: past, brewDays: brewSet }
}

function buildHeatmap(brewDays) {
  const today = toYMD(new Date())
  const cells = []
  for (let i = 89; i >= 0; i--) {
    const d = addDays(today, -i)
    cells.push({
      date: d,
      brewed: brewDays.has(d),
      isToday: d === today,
    })
  }
  return cells
}

function fmtDate(ymd) {
  return new Date(ymd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BrewStreaks({ entries }) {
  if (!entries.length) return null

  const { current, longest, streaks, brewDays } = computeStreaks(entries)
  const cells = buildHeatmap(brewDays)

  // Group cells into weeks (columns of 7)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className={styles.wrap}>
      <h3 className={styles.heading}>Brew streaks</h3>

      {/* Hero numbers */}
      <div className={styles.heroes}>
        <div className={styles.hero}>
          <span className={styles.heroVal}>{current}</span>
          <span className={styles.heroLbl}>Current streak</span>
          {current > 0 && <span className={styles.flame}>🔥</span>}
        </div>
        <div className={styles.heroDivider} />
        <div className={styles.hero}>
          <span className={styles.heroVal}>{longest}</span>
          <span className={styles.heroLbl}>Longest ever</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className={styles.heatmapWrap}>
        <p className={styles.heatmapLabel}>Last 90 days</p>
        <div className={styles.heatmap}>
          {weeks.map((week, wi) => (
            <div key={wi} className={styles.week}>
              {week.map((cell) => (
                <div
                  key={cell.date}
                  className={`${styles.cell} ${cell.brewed ? styles.cellBrewed : ''} ${cell.isToday ? styles.cellToday : ''}`}
                  title={`${fmtDate(cell.date)}${cell.brewed ? ' ☕' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Past streaks */}
      {streaks.length > 0 && (
        <div className={styles.history}>
          <p className={styles.historyLabel}>Past streaks</p>
          <div className={styles.historyList}>
            {streaks.map((s, i) => (
              <div key={i} className={styles.historyRow}>
                <span className={styles.historyLen}>{s.length} brew{s.length !== 1 ? 's' : ''}</span>
                <span className={styles.historyDates}>
                  {fmtDate(s.start)}{s.start !== s.end ? ` — ${fmtDate(s.end)}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
