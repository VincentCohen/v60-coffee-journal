import { useState, useEffect } from 'react'
import { supabase } from './supabase.js'
import BrewGuide from './components/BrewGuide.jsx'
import BrewTimer from './components/BrewTimer.jsx'
import LogForm   from './components/LogForm.jsx'
import Journal   from './components/Journal.jsx'
import Login     from './components/Login.jsx'
import BrewSession from './components/BrewSession.jsx'
import { useJournal } from './hooks/useJournal.js'
import styles from './App.module.css'

const TABS = [
  { id: 'brew',    icon: '☕', label: 'Brew'    },
  { id: 'timer',   icon: '⏱', label: 'Timer'   },
  { id: 'guide',   icon: '☕', label: 'Recipe'  },
  { id: 'log',     icon: '✏️', label: 'Log'     },
  { id: 'journal', icon: '📖', label: 'Journal' },
]

export default function App() {
  const [tab, setTab]             = useState('timer')
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'system'
    document.documentElement.setAttribute('data-theme', saved)
    return saved
  })

  const { entries, addEntry, deleteEntry, exportData, importData, getBeanMemory } = useJournal(user)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setShowLogin(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSave = (entry) => {
    addEntry(entry)
    setTab('journal')
  }

  const cycleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <span style={{ fontSize: '32px' }}>☕</span>
      </div>
    )
  }

  if (showLogin && !user) {
    return <Login onClose={() => setShowLogin(false)} />
  }

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <div className={styles.page}>
          {tab === 'brew'    && <BrewSession onSave={handleSave} getBeanMemory={getBeanMemory} />}
          {tab === 'timer'   && <BrewTimer />}
          {tab === 'log'     && <LogForm onSave={addEntry} getBeanMemory={getBeanMemory} />}
          {tab === 'guide'   && <BrewGuide />}
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

        <div className={styles.navSpacer} />

        <button className={styles.themeBtn} onClick={cycleTheme}>
          <span>{theme === 'dark' ? '☀️' : theme === 'light' ? '⚙️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light mode' : theme === 'light' ? 'System' : 'Dark mode'}</span>
        </button>

        {!user ? (
          <button className={styles.signInBtn} onClick={() => setShowLogin(true)}>
            <span>☁️</span>
            <span>Sign in to sync</span>
          </button>
        ) : (
          <button className={styles.signOutBtn} onClick={signOut}>
            <span>👋</span>
            <span>Sign out</span>
          </button>
        )}

      </nav>
    </div>
  )
}
