import { useRef, useState } from 'react'
import EntryCard from './EntryCard.jsx'
import LogForm from './LogForm.jsx'
import styles from './Journal.module.css'
import BrewStreaks from './BrewStreaks.jsx'

export default function Journal({ entries, onDelete, onExport, onImport, onSave, getBeanMemory }) {
  const fileRef = useRef(null)
  const [importMsg, setImportMsg] = useState(null)
  const [showLog, setShowLog]     = useState(false)

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

  const handleSave = (entry) => {
    onSave(entry)
    setShowLog(false)
  }

  const ratings = entries.filter(e => e.rating > 0).map(e => e.rating)
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '—'
  const uniqueBeans = [...new Set(entries.map(e => e.bean))].length

  if (showLog) return (
    <div className={styles.journal}>
      <div className={styles.logHeader}>
        <button className={styles.backBtn} onClick={() => setShowLog(false)}>← Back</button>
        <h2 className={styles.logTitle}>Log a Brew</h2>
      </div>
      <LogForm onSave={handleSave} getBeanMemory={getBeanMemory} />
    </div>
  )

  return (
    <div className={styles.journal}>
      <div className={styles.journalHeader}>
        <h2 className={styles.journalTitle}>Journal</h2>
        <button className={styles.logBtn} onClick={() => setShowLog(true)}>+ Log Brew</button>
      </div>

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
          <p>Log your first cup to get started.</p>
          <button className={styles.importCta} onClick={() => setShowLog(true)}>Log a brew</button>
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
