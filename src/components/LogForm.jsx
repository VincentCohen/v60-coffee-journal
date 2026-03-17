import { useState, useEffect } from 'react'
import styles from './LogForm.module.css'

const FLAVORS = ['Chocolate','Caramel','Citrus','Berry','Stone fruit','Floral','Nutty','Honey','Vanilla','Earthy','Tobacco','Winey']

const EMPTY = {
  bean:'', roaster:'', roast:'',
  grinder:'', grindSetting:'',  
  dose:'15', water:'250', temp:'94', drawdown:'',
  acidity:5, sweetness:5, body:5, bitterness:3,
  flavors:[], rating:0, notes:'',
}

export default function LogForm({ onSave, getBeanMemory }) {
  const [f, setF] = useState(EMPTY)
  const [flash, setFlash] = useState(false)

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const toggleFlavor = (x) => set('flavors', f.flavors.includes(x) ? f.flavors.filter(y => y !== x) : [...f.flavors, x])

  const save = () => {
    if (!f.bean.trim()) { alert('Please enter the bean or origin.'); return }
    onSave({ ...f, date: new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) })
    setF(EMPTY)
    setFlash(true)
    setTimeout(() => setFlash(false), 2200)
  }

  const [beanHint, setBeanHint] = useState(null)   // { bean, grinder, grindSetting }
  const [hintDismissed, setHintDismissed] = useState(false)

  useEffect(() => {
    if (hintDismissed) return
    const memory = getBeanMemory?.(f.bean)
    setBeanHint(memory || null)
  }, [f.bean, hintDismissed])

  const applyHint = () => {
    set('bean', beanHint.bean)
    set('roaster', beanHint.roaster)
    set('roast', beanHint.roast)
    set('grinder', beanHint.grinder)
    set('grindSetting', beanHint.grindSetting)

    setBeanHint(null)
    setHintDismissed(true)
  }

  const dismissHint = () => {
    setBeanHint(null)
    setHintDismissed(true)
  }

  // Reset dismissed state when bean field is cleared
  useEffect(() => {
    if (hintDismissed) { 
      return
    }

    const memory = getBeanMemory?.(f.bean, f.roaster)
    
    setBeanHint(memory || null)
  }, [f.bean, f.roaster, hintDismissed])

  return (
    <div className={styles.form}>
      {flash && <div className={styles.flash}>Brew saved — nice one! ✓</div>}
      {beanHint && (
        <div className={styles.beanHint}>
          <span>Last time with <strong>{[beanHint.roaster, beanHint.bean].filter(Boolean).join(' · ')}</strong>: {beanHint.grinder}{beanHint.grindSetting ? `, setting ${beanHint.grindSetting}` : ''} — use these?</span>
          <div className={styles.hintActions}>
            <button type="button" onClick={applyHint}>Use these</button>
            <button type="button" onClick={dismissHint}>✕</button>
          </div>
        </div>
      )}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Bean</legend>
        <div className={styles.stack}>
          <div className={styles.field}>
            <label>Origin / name *</label>
            <input type="text" placeholder="e.g. Ethiopia Yirgacheffe, natural" value={f.bean} onChange={e => set('bean', e.target.value)} />
          </div>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label>Roaster</label>
              <input type="text" placeholder="e.g. Square Mile" value={f.roaster} onChange={e => set('roaster', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Roast</label>
              <select value={f.roast} onChange={e => set('roast', e.target.value)}>
                <option value="">—</option>
                <option>Light</option>
                <option>Light-medium</option>
                <option>Medium</option>
                <option>Medium-dark</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </div>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label>Grinder</label>
            <input
              type="text"
              placeholder="e.g. Comandante C40"
              value={f.grinder}
              onChange={e => set('grinder', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Grind setting</label>
            <input
              type="text"
              placeholder="e.g. 24 clicks"
              value={f.grindSetting}
              onChange={e => set('grindSetting', e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Parameters</legend>
        <div className={styles.row4}>
          {[['Dose (g)','dose','number','10','25','0.1'],['Water (g)','water','number','100','400','5'],['Temp (°C)','temp','number','80','100','1'],['Drawdown','drawdown','text',null,null,null]].map(([lbl,key,type,min,max,step]) => (
            <div key={key} className={styles.field}>
              <label>{lbl}</label>
              <input
                type={type}
                value={f[key]}
                placeholder={key==='drawdown'?'3:20':undefined}
                min={min} max={max} step={step}
                onChange={e => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Taste profile</legend>
        <div className={styles.sliders}>
          {[['acidity','Acidity'],['sweetness','Sweetness'],['body','Body'],['bitterness','Bitterness']].map(([k,lbl]) => (
            <div key={k} className={styles.sliderRow}>
              <span className={styles.sliderLbl}>{lbl}</span>
              <input type="range" min="1" max="10" step="1" value={f[k]} onChange={e => set(k, +e.target.value)} />
              <span className={styles.sliderVal}>{f[k]}<small>/10</small></span>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Flavour notes</legend>
        <div className={styles.chips}>
          {FLAVORS.map(fl => (
            <button key={fl} type="button"
              className={`${styles.chip} ${f.flavors.includes(fl) ? styles.chipOn : ''}`}
              onClick={() => toggleFlavor(fl)}>{fl}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Rating</legend>
        <div className={styles.stars}>
          {[1,2,3,4,5].map(n => (
            <button key={n} type="button"
              className={`${styles.star} ${n <= f.rating ? styles.starOn : ''}`}
              onClick={() => set('rating', f.rating === n ? 0 : n)}
              aria-label={`${n} star${n!==1?'s':''}`}>★</button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Notes</legend>
        <textarea placeholder="How did it taste? What would you change?" value={f.notes} onChange={e => set('notes', e.target.value)} />
      </fieldset>

      <button className={styles.saveBtn} type="button" onClick={save}>Save brew</button>
    </div>
  )
}
