import { useState } from 'react'
import styles from './RecipeForm.module.css'

const EMPTY_STEP = { label: '', duration: 45, pourTarget: '', cue: '' }

function emptyForm() {
  return {
    name: '', description: '', doseG: '15', waterG: '250', tempC: '94',
    steps: [
      { label: 'Bloom',       duration: 45, pourTarget: '50',  cue: 'Pour in a slow spiral, saturate all grounds' },
      { label: 'First pour',  duration: 45, pourTarget: '150', cue: 'Pour steadily — gentle continuous spiral' },
      { label: 'Second pour', duration: 60, pourTarget: '250', cue: 'Pour slow and steady to finish' },
      { label: 'Drawdown',    duration: 90, pourTarget: '',    cue: 'Swirl gently, then wait for full drawdown' },
    ],
  }
}

export default function RecipeForm({ recipe, onSave, onCancel }) {
  const [form, setForm] = useState(() => recipe ? {
    name:        recipe.name        || '',
    description: recipe.description || '',
    doseG:       recipe.doseG  != null ? String(recipe.doseG)  : '15',
    waterG:      recipe.waterG != null ? String(recipe.waterG) : '250',
    tempC:       recipe.tempC  != null ? String(recipe.tempC)  : '94',
    steps: recipe.steps.map(s => ({
      label:      s.label      || '',
      duration:   s.duration   ?? 45,
      pourTarget: s.pourTarget != null ? String(s.pourTarget) : '',
      cue:        s.cue        || '',
    })),
  } : emptyForm())
  const [saving, setSaving] = useState(false)

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const setStep = (i, k, v) => setForm(p => ({
    ...p,
    steps: p.steps.map((s, idx) => idx === i ? { ...s, [k]: v } : s),
  }))

  const addStep = () => setForm(p => ({ ...p, steps: [...p.steps, { ...EMPTY_STEP }] }))

  const removeStep = (i) => setForm(p => ({ ...p, steps: p.steps.filter((_, idx) => idx !== i) }))

  const moveStep = (i, dir) => setForm(p => {
    const steps = [...p.steps]
    const j = i + dir
    if (j < 0 || j >= steps.length) return p
    ;[steps[i], steps[j]] = [steps[j], steps[i]]
    return { ...p, steps }
  })

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Recipe name is required.'); return }
    if (!form.steps.length) { alert('Add at least one step.'); return }
    if (form.steps.some(s => !s.label.trim())) { alert('All steps need a label.'); return }

    setSaving(true)
    await onSave({
      name:        form.name,
      description: form.description,
      doseG:       Number(form.doseG),
      waterG:      Number(form.waterG),
      tempC:       Number(form.tempC),
      steps: form.steps.map(s => ({
        label:      s.label,
        duration:   Number(s.duration),
        pourTarget: s.pourTarget !== '' ? Number(s.pourTarget) : null,
        cue:        s.cue,
      })),
    })
    setSaving(false)
  }

  const totalSecs = form.steps.reduce((s, x) => s + (Number(x.duration) || 0), 0)
  const fmt = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>{recipe ? 'Edit Recipe' : 'New Recipe'}</h2>
      </div>

      <div className={styles.field}>
        <label>Name *</label>
        <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. My Single Pour" />
      </div>

      <div className={styles.field}>
        <label>Description</label>
        <textarea value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Optional notes about this recipe…" />
      </div>

      <div className={styles.row3}>
        <div className={styles.field}>
          <label>Dose (g)</label>
          <input type="number" min="1" max="50" step="0.5" value={form.doseG} onChange={e => setField('doseG', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Water (g)</label>
          <input type="number" min="50" max="1000" step="5" value={form.waterG} onChange={e => setField('waterG', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Temp (°C)</label>
          <input type="number" min="60" max="100" step="1" value={form.tempC} onChange={e => setField('tempC', e.target.value)} />
        </div>
      </div>

      <div className={styles.stepsSection}>
        <div className={styles.stepsHeader}>
          <span className={styles.stepsTitle}>Steps <span className={styles.stepsSummary}>· {form.steps.length} steps · {fmt(totalSecs)}</span></span>
          <button type="button" className={styles.addStepBtn} onClick={addStep}>+ Add step</button>
        </div>

        <div className={styles.stepsList}>
          {form.steps.map((step, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepCardHeader}>
                <span className={styles.stepNum}>{i + 1}</span>
                <div className={styles.stepReorder}>
                  <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" onClick={() => moveStep(i, 1)} disabled={i === form.steps.length - 1}>↓</button>
                </div>
                <button type="button" className={styles.removeStep} onClick={() => removeStep(i)}>✕</button>
              </div>

              <div className={styles.stepRow2}>
                <div className={styles.field}>
                  <label>Label *</label>
                  <input type="text" value={step.label} onChange={e => setStep(i, 'label', e.target.value)} placeholder="e.g. Bloom" />
                </div>
                <div className={styles.field}>
                  <label>Duration (s)</label>
                  <input type="number" min="5" max="600" step="5" value={step.duration} onChange={e => setStep(i, 'duration', Number(e.target.value))} />
                </div>
                <div className={styles.field}>
                  <label>Pour target (g)</label>
                  <input type="number" min="0" max="2000" step="5" value={step.pourTarget} onChange={e => setStep(i, 'pourTarget', e.target.value)} placeholder="—" />
                </div>
              </div>

              <div className={styles.field}>
                <label>Instruction</label>
                <input type="text" value={step.cue} onChange={e => setStep(i, 'cue', e.target.value)} placeholder="e.g. Pour in slow circles to saturate grounds" />
              </div>
            </div>
          ))}
        </div>
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
