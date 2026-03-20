import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { supabase } from './supabase.js'
import { JH_RECIPE } from './defaultRecipe.js'
import BrewTimer       from './components/BrewTimer.jsx'
import Journal         from './components/Journal.jsx'
import Login           from './components/Login.jsx'
import BrewSession     from './components/BrewSession.jsx'
import Beans           from './components/Beans.jsx'
import RecipeManager   from './components/RecipeManager.jsx'
import Settings        from './components/Settings.jsx'
import { useJournal } from './hooks/useJournal.js'
import Logo from './components/Logo.jsx'
import styles from './App.module.css'

const TABS = [
  { path: '/guide',    icon: '📋', label: 'Recipes' },
  { path: '/beans',   icon: '🫘', label: 'Beans'   },
  { path: '/brew',    icon: '☕', label: 'Brew', center: true },
  { path: '/journal', icon: '📖', label: 'Journal' },
  { path: '/settings', icon: '⋯', label: 'More'   },
]

export default function App() {
  const [user, setUser]                 = useState(null)
  const [loading, setLoading]           = useState(true)
  const [brewWithBean, setBrewWithBean] = useState(null)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'system'
    document.documentElement.setAttribute('data-theme', saved)
    return saved
  })

  const navigate = useNavigate()
  const {
    entries, beans, recipes, activeRecipeId,
    addEntry, deleteEntry, exportData, importData, getBeanMemory,
    addBean, updateBean, deleteBean,
    addRecipe, updateRecipe, deleteRecipe, setActiveRecipe,
  } = useJournal(user)

  // Resolve active recipe — fall back to JH default
  const activeRecipe = (activeRecipeId && recipes.find(r => r.id === activeRecipeId)) || JH_RECIPE

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSave = (entry) => {
    addEntry(entry)
    navigate('/journal')
  }

  const handleBrewWithBean = (bean) => {
    setBrewWithBean(bean)
    navigate('/brew')
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

  if (!user) return <Login />

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <div className={styles.page}>
          <Routes>
            <Route path="/" element={<Navigate to="/brew" replace />} />
            <Route path="/brew" element={
              <>
                <div className={styles.timerCard}>
                  <div className={styles.timerCardInfo}>
                    <span className={styles.timerCardLabel}>Quick Timer</span>
                    <span className={styles.timerCardRecipe}>{activeRecipe.name}</span>
                    <span className={styles.timerCardMeta}>
                      {activeRecipe.steps.length} steps · {Math.floor(activeRecipe.steps.reduce((s, x) => s + x.duration, 0) / 60)}:{String(activeRecipe.steps.reduce((s, x) => s + x.duration, 0) % 60).padStart(2, '0')} min
                    </span>
                  </div>
                  <button className={styles.timerCardBtn} onClick={() => navigate('/timer')}>
                    Start →
                  </button>
                </div>
                <BrewSession
                  onSave={handleSave}
                  getBeanMemory={getBeanMemory}
                  beans={beans}
                  allRecipes={[JH_RECIPE, ...recipes]}
                  activeRecipe={activeRecipe}
                  initialBean={brewWithBean}
                  onBeanConsumed={() => setBrewWithBean(null)}
                />
              </>
            } />
            <Route path="/timer" element={<BrewTimer recipe={activeRecipe} />} />
            <Route path="/guide" element={
              <RecipeManager
                recipes={recipes}
                activeRecipeId={activeRecipeId || JH_RECIPE.id}
                onAdd={addRecipe}
                onUpdate={updateRecipe}
                onDelete={deleteRecipe}
                onActivate={setActiveRecipe}
              />
            } />
            <Route path="/beans" element={
              <Beans
                beans={beans}
                entries={entries}
                onAdd={addBean}
                onUpdate={updateBean}
                onDelete={deleteBean}
                onBrewWith={handleBrewWithBean}
              />
            } />
            <Route path="/beans/:id" element={
              <Beans
                beans={beans}
                entries={entries}
                onAdd={addBean}
                onUpdate={updateBean}
                onDelete={deleteBean}
                onBrewWith={handleBrewWithBean}
              />
            } />
            <Route path="/journal" element={
              <Journal
                entries={entries}
                beans={beans}
                onDelete={deleteEntry}
                onExport={exportData}
                onImport={importData}
                onSave={addEntry}
                getBeanMemory={getBeanMemory}
              />
            } />
            <Route path="/settings" element={
              <Settings
                user={user}
                theme={theme}
                onCycleTheme={cycleTheme}
                onSignOut={signOut}
              />
            } />
            <Route path="*" element={<Navigate to="/brew" replace />} />
          </Routes>
        </div>
      </main>

      <nav className={styles.nav}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Logo size={56} className={styles.brandLogo} />
            <h1 className={styles.title}>
              <span className={styles.titleJust}>just </span>
              <span className={styles.titlePoured}>poured</span>
            </h1>
            <p className={styles.sub}>Coffee Journal</p>
          </div>
        </header>

        {TABS.map(t => (
          <NavLink
            key={t.path}
            to={t.path}
            end={t.path === '/beans' ? false : true}
            className={({ isActive }) =>
              `${styles.navBtn} ${t.center ? styles.navBtnCenter : ''} ${isActive ? styles.navBtnActive : ''}`
            }
          >
            <span className={t.center ? styles.navIconCenter : styles.navIcon}>{t.icon}</span>
            <span className={styles.navLabel}>
              {t.label}
              {t.path === '/journal' && entries.length > 0 && (
                <span className={styles.badge}>{entries.length}</span>
              )}
              {t.path === '/beans' && beans.length > 0 && (
                <span className={styles.badge}>{beans.length}</span>
              )}
            </span>
          </NavLink>
        ))}

        <div className={styles.navSpacer} />

        <button className={styles.themeBtn} onClick={cycleTheme}>
          <span>{theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⚙️'}</span>
          <span>{theme === 'dark' ? 'Dark mode' : theme === 'light' ? 'Light mode' : 'System'}</span>
        </button>

        <button className={styles.signOutBtn} onClick={signOut}>
          <span>👋</span>
          <span>Sign out</span>
        </button>
      </nav>
    </div>
  )
}
