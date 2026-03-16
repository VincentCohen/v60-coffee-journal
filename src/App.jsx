import { useState } from 'react'
import BrewGuide from './components/BrewGuide.jsx'
import BrewTimer from './components/BrewTimer.jsx'
import LogForm   from './components/LogForm.jsx'
import Journal   from './components/Journal.jsx'
import { useJournal } from './hooks/useJournal.js'
import styles from './App.module.css'

const TABS = [
  { id: 'timer',   icon: '⏱', label: 'Timer'   },
  { id: 'guide',   icon: '☕', label: 'Recipe'  },
  { id: 'log',     icon: '✏️', label: 'Log'     },
  { id: 'journal', icon: '📖', label: 'Journal' },
]

export default function App() {
  const [tab, setTab] = useState('timer')
  const { entries, addEntry, deleteEntry, exportData, importData } = useJournal()

  const handleSave = (entry) => {
    addEntry(entry)

    setTab('journal')
  }

  return (
    <div className={styles.app}>

      <main className={styles.main}>
        <div className={styles.page}>
          {tab === 'timer'   && <BrewTimer />}
          {tab === 'guide'   && <BrewGuide />}
          {tab === 'log'     && <LogForm onSave={handleSave} />}
          {tab === 'journal' && (
            <Journal
              entries={entries}
              onDelete={deleteEntry}
              onExport={exportData}
              onImport={importData}
            />
          )}
        </div>
      </main>

      <nav className={styles.nav}>
        <header className={styles.header}>
          <h1 className={styles.title}>V60 Journal</h1>
          <p className={styles.sub}>James Hoffman's recipe</p>
        </header>
        
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.navBtn} ${tab === t.id ? styles.navBtnActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className={styles.navIcon}>{t.icon}</span>
            <span className={styles.navLabel}>
              {t.label}
              {t.id === 'journal' && entries.length > 0 && (
                <span className={styles.badge}>{entries.length}</span>
              )}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
