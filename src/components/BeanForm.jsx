import { useState } from 'react'
import styles from './BeanForm.module.css'

const ROAST_LEVELS = ['Light', 'Light-medium', 'Medium', 'Medium-dark', 'Dark']

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'IDR', 'AUD', 'CAD', 'CHF']

function emptyForm() {
  return {
    name: '', roaster: '', origin: '', process: '', varietal: '',
    roastLevel: '', roastDate: '', purchaseDate: '',
    weightG: '', price: '', currency: 'USD', notes: '',
  }
}

export default function BeanForm({ bean, onSave, onCancel }) {
  const [form, setForm] = useState(() => bean ? {
    name:         bean.name         || '',
    roaster:      bean.roaster      || '',
    origin:       bean.origin       || '',
    process:      bean.process      || '',
    varietal:     bean.varietal     || '',
    roastLevel:   bean.roastLevel   || '',
    roastDate:    bean.roastDate    || '',
    purchaseDate: bean.purchaseDate || '',
    weightG:      bean.weightG   != null ? String(bean.weightG)  : '',
    price:        bean.price     != null ? String(bean.price)    : '',
    currency:     bean.currency     || 'USD',
    notes:        bean.notes        || '',
  } : emptyForm())
  const [saving, setSaving] = useState(false)
  const [roastMode, setRoastMode] = useState(() => {
    if (!bean?.roastLevel) return 'standard'
    return ROAST_LEVELS.includes(bean.roastLevel) ? 'standard' : 'custom'
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Bean name is required.'); return }
    setSaving(true)
    const result = await onSave(form)
    setSaving(false)
    if (result?.error) alert('Failed to save: ' + result.error.message)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>{bean ? 'Edit Bean' : 'New Bean'}</h2>
        <p className={styles.sub}>{bean ? 'Update bean information.' : 'Add a bean to your collection.'}</p>
      </div>

      <div className={styles.field}>
        <label>Name *</label>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ethiopia Yirgacheffe" />
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Roaster</label>
          <input type="text" value={form.roaster} onChange={e => set('roaster', e.target.value)} placeholder="e.g. Blue Bottle" />
        </div>
        <div className={styles.field}>
          <label>Origin</label>
          <input type="text" value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="e.g. Ethiopia" />
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Process</label>
          <input type="text" value={form.process} onChange={e => set('process', e.target.value)} placeholder="e.g. Washed" />
        </div>
        <div className={styles.field}>
          <label>Varietal</label>
          <input type="text" value={form.varietal} onChange={e => set('varietal', e.target.value)} placeholder="e.g. Typica, Bourbon" />
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Roast Date</label>
          <input type="date" value={form.roastDate} onChange={e => set('roastDate', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Purchase Date</label>
          <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label>Roast Level</label>
        <div className={styles.modeToggle}>
          <button
            type="button"
            className={roastMode === 'standard' ? styles.modeActive : styles.modeBtn}
            onClick={() => setRoastMode('standard')}
          >Standard</button>
          <button
            type="button"
            className={roastMode === 'custom' ? styles.modeActive : styles.modeBtn}
            onClick={() => setRoastMode('custom')}
          >Custom</button>
        </div>
        {roastMode === 'standard' ? (
          <select value={form.roastLevel} onChange={e => set('roastLevel', e.target.value)}>
            <option value="">Select roast level</option>
            {ROAST_LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        ) : (
          <input type="text" value={form.roastLevel} onChange={e => set('roastLevel', e.target.value)} placeholder="e.g. Omni roast" />
        )}
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>Price</label>
          <div className={styles.priceRow}>
            <select value={form.currency} onChange={e => set('currency', e.target.value)} className={styles.currencySelect}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" min="0" step="0.01" />
          </div>
        </div>
        <div className={styles.field}>
          <label>Weight (g)</label>
          <input type="number" value={form.weightG} onChange={e => set('weightG', e.target.value)} placeholder="e.g. 200" min="0" />
        </div>
      </div>

      <div className={styles.field}>
        <label>Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Tasting notes, impressions…" />
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel} disabled={saving}>Cancel</button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
