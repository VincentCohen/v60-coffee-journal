import { useRef, useState } from 'react'
import EntryCard from './EntryCard.jsx'
import styles from './Journal.module.css'
import BrewStreaks from './BrewStreaks.jsx'

export default function Journal({ entries, onDelete, onExport, onImport }) {
  const fileRef = useRef(null)
  const [importMsg, setImportMsg] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const count = await onImport(file)
      setImportMsg(`Imported ${count} brew${count !== 1 ? 's' : ''}!`)
    } catch (err) {
      setImportMsg(`Error: ${err.message}`)
    }
    e.target.value = ''
    setTimeout(() => setImportMsg(null), 3000)
  }

  const ratings = entries.filter(e => e.rating > 0).map(e => e.rating)
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '—'
  const uniqueBeans = [...new Set(entries.map(e => e.bean))].length

  return (
    <div className={styles.journal}>
      {entries.length > 0 && (
        <>
          <div className={styles.stats}>
            {[['Brews', entries.length], ['Avg ★', avgRating], ['Beans', uniqueBeans]].map(([l, v]) => (
              <div key={l} className={styles.stat}>
                <span className={styles.statVal}>{v}</span>
                <span className={styles.statLbl}>{l}</span>
              </div>
            ))}
          </div>

          <div className={styles.dataBar}>
            <button className={styles.dataBtn} onClick={onExport}>
              <span>↓</span> Export
            </button>
            <button className={styles.dataBtn} onClick={() => fileRef.current.click()}>
              <span>↑</span> Import
            </button>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
          </div>

          <BrewStreaks entries={entries} />
        </>
      )}

      {importMsg && <div className={styles.importMsg}>{importMsg}</div>}

      {!entries.length ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>☕</span>
          <h3>No brews yet</h3>
          <p>Go to <em>Log</em> to record your first cup.</p>
          <button className={styles.importCta} onClick={() => fileRef.current.click()}>
            Import existing journal
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      ) : (
        <div className={styles.entries}>
          {entries.map(e => <EntryCard key={e.id} entry={e} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  )
}
