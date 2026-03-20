import { useState, useEffect, useRef } from 'react'
import BrewTimer from './BrewTimer.jsx'
import styles from './BrewSession.module.css'

const FLAVORS = ['Chocolate','Caramel','Citrus','Berry','Stone fruit','Floral','Nutty','Honey','Vanilla','Earthy','Tobacco','Winey']

const EMPTY_TASTING = {
  acidity: 5, sweetness: 5, body: 5, bitterness: 3,
  flavors: [], rating: 0, notes: '',
}

function emptySetup(recipe) {
  return {
    bean: '', roaster: '', roast: '',
    grinder: '', grindSetting: '',
    dose:  String(recipe?.doseG  ?? 15),
    water: String(recipe?.waterG ?? 250),
    temp:  String(recipe?.tempC  ?? 94),
    drawdown: '',
  }
}

function secsToString(secs) {
  if (!secs || secs <= 0) return ''
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function BrewSession({ onSave, getBeanMemory, beans = [], allRecipes = [], activeRecipe = null, initialBean = null, onBeanConsumed }) {
  const [phase, setPhase]                     = useState('setup')
  const [selectedRecipe, setSelectedRecipe]   = useState(activeRecipe)
  const [userPickedRecipe, setUserPickedRecipe] = useState(false)
  const [setup, setSetup]                     = useState(() => emptySetup(activeRecipe))
  const [tasting, setTasting]                 = useState(EMPTY_TASTING)
  const [beanHint, setBeanHint]               = useState(null)
  const [hintDismissed, setHintDismissed]     = useState(false)
  const [saved, setSaved]                     = useState(false)
  const [selectedBeanId, setSelectedBeanId]   = useState(null)

  const getTotalSecsRef = useRef(null)

  const setS = (k, v) => setSetup(p => ({ ...p, [k]: v }))
  const setT = (k, v) => setTasting(p => ({ ...p, [k]: v }))
  const toggleFlavor = (x) => setT('flavors', tasting.flavors.includes(x)
    ? tasting.flavors.filter(y => y !== x)
    : [...tasting.flavors, x]
  )

  // Keep selectedRecipe in sync when activeRecipe loads/changes (only if user hasn't manually picked one)
  useEffect(() => {
    if (activeRecipe && !userPickedRecipe) {
      setSelectedRecipe(activeRecipe)
      setSetup(p => ({ ...p, dose: String(activeRecipe.doseG), water: String(activeRecipe.waterG), temp: String(activeRecipe.tempC) }))
    }
  }, [activeRecipe])

  // Apply initialBean when coming from "Brew with this bean"
  useEffect(() => {
    if (initialBean) {
      setSetup(p => ({
        ...p,
        bean: initialBean.name,
        roaster: initialBean.roaster || '',
        roast: initialBean.roastLevel || '',
      }))
      setSelectedBeanId(initialBean.id)
      onBeanConsumed?.()
    }
  }, [initialBean])

  const selectBean = (beanId) => {
    const bean = beans.find(b => b.id === beanId)
    if (bean) {
      setSetup(p => ({
        ...p,
        bean: bean.name,
        roaster: bean.roaster || '',
        roast: bean.roastLevel || '',
      }))
      setSelectedBeanId(beanId)
      setBeanHint(null)
      setHintDismissed(true)
    } else {
      setSelectedBeanId(null)
    }
  }

  const selectRecipe = (recipeId) => {
    const recipe = allRecipes.find(r => r.id === recipeId)
    if (recipe) {
      setSelectedRecipe(recipe)
      setUserPickedRecipe(true)
      setSetup(p => ({
        ...p,
        dose:  String(recipe.doseG),
        water: String(recipe.waterG),
        temp:  String(recipe.tempC),
      }))
    }
  }

  useEffect(() => {
    if (hintDismissed) return
    const memory = getBeanMemory?.(setup.bean, setup.roaster)
    setBeanHint(memory || null)
  }, [setup.bean, setup.roaster, hintDismissed])

  const applyHint = () => {
    setSetup(p => ({
      ...p,
      bean: beanHint.bean,
      roaster: beanHint.roaster,
      roast: beanHint.roast,
      grinder: beanHint.grinder,
      grindSetting: beanHint.grindSetting,
    }))
    setBeanHint(null)
    setHintDismissed(true)
  }

  const handleTimerDone = (totalSecs) => {
    setSetup(p => ({ ...p, drawdown: secsToString(totalSecs) }))
    setPhase('tasting')
  }

  const handleSkipToTasting = () => {
    const secs = getTotalSecsRef.current?.() ?? 0
    setSetup(p => ({ ...p, drawdown: secsToString(secs) }))
    setPhase('tasting')
  }

  const startBrew = () => {
    if (!setup.bean.trim()) { alert('Please enter the bean or origin.'); return }
    getTotalSecsRef.current = null
    setPhase('timer')
  }

  const handleSave = () => {
    onSave({
      ...setup,
      ...tasting,
      beanId: selectedBeanId || null,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    })
    setSaved(true)
    setTimeout(() => {
      setPhase('setup')
      setSetup(emptySetup(selectedRecipe))
      setTasting(EMPTY_TASTING)
      setHintDismissed(false)
      setSelectedBeanId(null)
      setUserPickedRecipe(false)
      setSaved(false)
    }, 1800)
  }

  const handleDiscard = () => {
    setPhase('setup')
    setSetup(emptySetup(selectedRecipe))
    setTasting(EMPTY_TASTING)
    setHintDismissed(false)
    setSelectedBeanId(null)
    setUserPickedRecipe(false)
    getTotalSecsRef.current = null
  }

  // ── Setup ──────────────────────────────────────────────
  if (phase === 'setup') return (
    <div className={styles.wrap}>
      <div className={styles.phaseHeader}>
        <span className={styles.phaseLabel}>Before you brew</span>
        <h2 className={styles.phaseTitle}>Set up your parameters</h2>
      </div>

      {/* Bean + Recipe selectors side by side */}
      <div className={styles.quickSelect}>
        <div className={styles.quickSelectField}>
          <label className={styles.quickLabel}>Bean</label>
          <div className={styles.quickRow}>
            <select
              value={selectedBeanId || ''}
              onChange={e => selectBean(e.target.value || null)}
            >
              <option value="">Select bean…</option>
              {beans.map(b => (
                <option key={b.id} value={b.id}>
                  {[b.roaster, b.name].filter(Boolean).join(' · ')}
                </option>
              ))}
            </select>
            {selectedBeanId && (
              <button type="button" className={styles.clearBtn} onClick={() => { setSelectedBeanId(null); setHintDismissed(false) }}>✕</button>
            )}
          </div>
        </div>

        <div className={styles.quickSelectField}>
          <label className={styles.quickLabel}>Recipe</label>
          <select
            value={selectedRecipe?.id || ''}
            onChange={e => selectRecipe(e.target.value)}
          >
            {allRecipes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {beanHint && (
        <div className={styles.beanHint}>
          <span>Last time with <strong>{[beanHint.roaster, beanHint.bean].filter(Boolean).join(' · ')}</strong>: {beanHint.grinder}{beanHint.grindSetting ? `, setting ${beanHint.grindSetting}` : ''} — use these?</span>
          <div className={styles.hintActions}>
            <button type="button" onClick={applyHint}>Use these</button>
            <button type="button" onClick={() => { setBeanHint(null); setHintDismissed(true) }}>✕</button>
          </div>
        </div>
      )}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Bean</legend>
        <div className={styles.stack}>
          <div className={styles.field}>
            <label>Origin / name *</label>
            <input type="text" placeholder="e.g. Ethiopia Yirgacheffe, natural"
              value={setup.bean} onChange={e => setS('bean', e.target.value)} />
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Roaster</label>
              <input type="text" placeholder="e.g. Square Mile"
                value={setup.roaster} onChange={e => setS('roaster', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Roast</label>
              <select value={setup.roast} onChange={e => setS('roast', e.target.value)}>
                <option value="">—</option>
                <option>Light</option>
                <option>Light-medium</option>
                <option>Medium</option>
                <option>Medium-dark</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Grinder</label>
              <input type="text" placeholder="e.g. Comandante C40"
                value={setup.grinder} onChange={e => setS('grinder', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Grind setting</label>
              <input type="text" placeholder="e.g. 24 clicks"
                value={setup.grindSetting} onChange={e => setS('grindSetting', e.target.value)} />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Parameters</legend>
        <div className={styles.row4}>
          {[
            ['Dose (g)',  'dose',  'number', '10',  '25',  '0.1'],
            ['Water (g)', 'water', 'number', '100', '400', '5'  ],
            ['Temp (°C)', 'temp',  'number', '80',  '100', '1'  ],
          ].map(([lbl, key, type, min, max, step]) => (
            <div key={key} className={styles.field}>
              <label>{lbl}</label>
              <input
                type={type}
                value={setup[key]}
                min={min} max={max} step={step}
                onChange={e => setS(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <button className={styles.startBtn} onClick={startBrew}>
        Start brewing →
      </button>
    </div>
  )

  // ── Timer ──────────────────────────────────────────────
  if (phase === 'timer') return (
    <div className={styles.wrap}>
      <div className={styles.phaseHeader}>
        <span className={styles.phaseLabel}>
          {[setup.roaster, setup.bean].filter(Boolean).join(' · ')}
        </span>
        <h2 className={styles.phaseTitle}>Brewing</h2>
      </div>
      <BrewTimer
        recipe={selectedRecipe}
        onDone={handleTimerDone}
        onRequestTotalSecs={(getFn) => { getTotalSecsRef.current = getFn }}
      />
      <button className={styles.skipTasting} onClick={handleSkipToTasting}>
        Skip to tasting →
      </button>
    </div>
  )

  // ── Tasting ────────────────────────────────────────────
  if (phase === 'tasting') return (
    <div className={styles.wrap}>
      {saved && <div className={styles.flash}>Brew saved — nice one! ✓</div>}

      <div className={styles.phaseHeader}>
        <span className={styles.phaseLabel}>
          {[setup.roaster, setup.bean].filter(Boolean).join(' · ')}
        </span>
        <h2 className={styles.phaseTitle}>How did it taste?</h2>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Taste profile</legend>
        <div className={styles.sliders}>
          {[['acidity','Acidity'],['sweetness','Sweetness'],['body','Body'],['bitterness','Bitterness']].map(([k, lbl]) => (
            <div key={k} className={styles.sliderRow}>
              <span className={styles.sliderLbl}>{lbl}</span>
              <input type="range" min="1" max="10" step="1"
                value={tasting[k]} onChange={e => setT(k, +e.target.value)} />
              <span className={styles.sliderVal}>{tasting[k]}<small>/10</small></span>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Flavour notes</legend>
        <div className={styles.chips}>
          {FLAVORS.map(fl => (
            <button key={fl} type="button"
              className={`${styles.chip} ${tasting.flavors.includes(fl) ? styles.chipOn : ''}`}
              onClick={() => toggleFlavor(fl)}>{fl}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Rating</legend>
        <div className={styles.stars}>
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button"
              className={`${styles.star} ${n <= tasting.rating ? styles.starOn : ''}`}
              onClick={() => setT('rating', tasting.rating === n ? 0 : n)}
              aria-label={`${n} star${n !== 1 ? 's' : ''}`}>★</button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Notes</legend>
        <textarea placeholder="How did it taste? What would you change?"
          value={tasting.notes} onChange={e => setT('notes', e.target.value)} />
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Drawdown time</legend>
        <div className={styles.field}>
          <input
            type="text"
            placeholder="e.g. 3:20"
            value={setup.drawdown}
            onChange={e => setS('drawdown', e.target.value)}
          />
        </div>
      </fieldset>

      <div className={styles.tastingActions}>
        <button className={styles.saveBtn} onClick={handleSave}>Save brew</button>
        <button className={styles.discardBtn} onClick={handleDiscard}>Discard</button>
      </div>
    </div>
  )
}
