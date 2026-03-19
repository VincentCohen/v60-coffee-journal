import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './BrewTimer.module.css'

const STEPS = [
  { label: 'Bloom',        cue: 'Pour 50 g — slow spiral, saturate all grounds', target: 45,  pour: '→ 50 g',  colour: '#a07850' },
  { label: 'First pour',   cue: 'Pour steadily to 150 g — gentle continuous spiral', target: 45, pour: '→ 150 g', colour: '#8a6240' },
  { label: 'Second pour',  cue: 'Pour to 250 g — slow and steady to finish', target: 60, pour: '→ 250 g', colour: '#6b4e2e' },
  { label: 'Drawdown',     cue: 'Swirl the dripper gently, then wait for full drawdown', target: 90, pour: null, colour: '#3d2a14' },
]

const TOTAL = STEPS.reduce((s, x) => s + x.target, 0)

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function BrewTimer({ onDone, onStepChange, onStart, onPause, onResume } = {}) {
  const [state, setState]             = useState('idle')
  const [realElapsed, setRealElapsed] = useState(0)
  const [stepIdx, setStepIdx]         = useState(0)
  const [stepElapsed, setStepElapsed] = useState(0)
  const intervalRef     = useRef(null)
  const startRef        = useRef(null)
  const realBaseRef     = useRef(0)
  const stepStartRef    = useRef(null)
  const stepBaseRef     = useRef(0)
  const stepIdxRef      = useRef(0)
  const onStepChangeRef = useRef(onStepChange)
  const onDoneRef       = useRef(onDone)
  const onStartRef      = useRef(onStart)
  const onPauseRef      = useRef(onPause)
  const onResumeRef     = useRef(onResume)

  useEffect(() => { onStepChangeRef.current = onStepChange }, [onStepChange])
  useEffect(() => { onDoneRef.current = onDone }, [onDone])
  useEffect(() => { onStartRef.current = onStart }, [onStart])
  useEffect(() => { onPauseRef.current = onPause }, [onPause])
  useEffect(() => { onResumeRef.current = onResume }, [onResume])

  const currentStep = STEPS[Math.min(stepIdx, STEPS.length - 1)]

  const tick = useCallback(() => {
    const now = Date.now()

    const real = realBaseRef.current + Math.floor((now - startRef.current) / 1000)
    setRealElapsed(real)

    const se = stepBaseRef.current + Math.floor((now - stepStartRef.current) / 1000)
    setStepElapsed(se)

    const currentTarget = STEPS[stepIdxRef.current].target
    if (se >= currentTarget && stepIdxRef.current < STEPS.length - 1) {
      const nextIdx = stepIdxRef.current + 1
      stepIdxRef.current = nextIdx
      setStepIdx(nextIdx)
      stepStartRef.current = now
      stepBaseRef.current  = 0
      onStepChangeRef.current?.(nextIdx)
    }

    if (stepIdxRef.current === STEPS.length - 1) {
      const lastSe = stepBaseRef.current + Math.floor((now - stepStartRef.current) / 1000)
      if (lastSe >= STEPS[STEPS.length - 1].target) {
        clearInterval(intervalRef.current)
        setState('done')
        onDoneRef.current?.()
      }
    }
  }, [])

  const start = () => {
    const now = Date.now()
    startRef.current     = now
    stepStartRef.current = now
    intervalRef.current  = setInterval(tick, 250)
    setState('running')
    onStartRef.current?.()
  }

  const pause = () => {
    clearInterval(intervalRef.current)
    const now = Date.now()
    realBaseRef.current += Math.floor((now - startRef.current) / 1000)
    stepBaseRef.current += Math.floor((now - stepStartRef.current) / 1000)
    setState('paused')
    onPauseRef.current?.()
  }

  const resume = () => {
    const now = Date.now()
    startRef.current     = now
    stepStartRef.current = now
    intervalRef.current  = setInterval(tick, 250)
    setState('running')
    onResumeRef.current?.()
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setState('idle')
    setRealElapsed(0)
    setStepIdx(0)
    setStepElapsed(0)
    stepIdxRef.current   = 0
    realBaseRef.current  = 0
    stepBaseRef.current  = 0
    startRef.current     = null
    stepStartRef.current = null
  }

  const skipStep = () => {
    if (stepIdxRef.current >= STEPS.length - 1) return
    const now     = Date.now()
    const nextIdx = stepIdxRef.current + 1
    stepIdxRef.current   = nextIdx
    setStepIdx(nextIdx)
    stepStartRef.current = now
    stepBaseRef.current  = 0
    setStepElapsed(0)
    onStepChangeRef.current?.(nextIdx)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const R    = 54
  const CIRC = 2 * Math.PI * R
  const totalProgress = Math.min(realElapsed / TOTAL, 1)
  const dashTotal     = CIRC * (1 - totalProgress)
  const stepProgress  = Math.min(stepElapsed / currentStep.target, 1)
  const dash          = CIRC * (1 - stepProgress)

  return (
    <div className={styles.wrap}>
      <div className={styles.ring}>
        <svg viewBox="0 0 128 128" className={styles.svg}>
          <circle cx="64" cy="64" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle cx="64" cy="64" r={R} fill="none" stroke="var(--c200)" strokeWidth="2"
            strokeDasharray={CIRC} strokeDashoffset={dashTotal}
            strokeLinecap="round" transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset .25s linear' }} />
          <circle cx="64" cy="64" r={R} fill="none" stroke={currentStep.colour} strokeWidth="6"
            strokeDasharray={CIRC} strokeDashoffset={dash}
            strokeLinecap="round" transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset .25s linear' }} />
        </svg>
        <div className={styles.ringInner}>
          {state === 'done' ? (
            <span className={styles.doneIcon}>✓</span>
          ) : (
            <>
              <span className={styles.elapsed}>{fmt(realElapsed)}</span>
              <span className={styles.total}>/ {fmt(TOTAL)}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.stepDots}>
        {STEPS.map((s, i) => (
          <div key={i} className={`${styles.dot} ${i < stepIdx ? styles.dotDone : ''} ${i === stepIdx && state !== 'idle' && state !== 'done' ? styles.dotActive : ''}`} />
        ))}
      </div>

      <div className={styles.cueCard} style={state !== 'idle' && state !== 'done' ? { borderColor: currentStep.colour + '44' } : {}}>
        {state === 'idle' && (
          <>
            <p className={styles.cueName}>Ready when you are</p>
            <p className={styles.cueDetail}>Hit start when you begin pouring the bloom</p>
          </>
        )}
        {(state === 'running' || state === 'paused') && (
          <>
            <div className={styles.cueRow}>
              <span className={styles.cueName}>{currentStep.label}</span>
              {currentStep.pour && <span className={styles.cuePour}>{currentStep.pour}</span>}
            </div>
            <p className={styles.cueDetail}>{currentStep.cue}</p>
            <p className={styles.cueTime}>{fmt(stepElapsed)} / {fmt(currentStep.target)}</p>
          </>
        )}
        {state === 'done' && (
          <>
            <p className={styles.cueName}>Done! ☕</p>
            <p className={styles.cueDetail}>Drawdown complete. Enjoy your coffee.</p>
          </>
        )}
      </div>

      <div className={styles.timeline}>
        {STEPS.map((s, i) => {
          const start = STEPS.slice(0, i).reduce((a, x) => a + x.target, 0)
          const done   = i < stepIdx || (i === stepIdx && state === 'done')
          const active = i === stepIdx && state !== 'idle' && state !== 'done'
          return (
            <div key={i} className={`${styles.timelineItem} ${done ? styles.timelineDone : ''} ${active ? styles.timelineActive : ''}`}>
              <span className={styles.timelineLabel}>{s.label}</span>
              <span className={styles.timelineTime}>{fmt(start)}</span>
            </div>
          )
        })}
      </div>

      <div className={styles.controls}>
        {state === 'idle' && (
          <button className={styles.btnPrimary} onClick={start}>Start brew</button>
        )}
        {state === 'running' && (
          <>
            <button className={styles.btnSecondary} onClick={pause}>Pause</button>
            {stepIdx < STEPS.length - 1 && (
              <button className={styles.btnGhost} onClick={skipStep}>Skip →</button>
            )}
            <button className={styles.btnGhost} onClick={reset}>Reset</button>
          </>
        )}
        {state === 'paused' && (
          <>
            <button className={styles.btnPrimary} onClick={resume}>Resume</button>
            <button className={styles.btnGhost} onClick={reset}>Reset</button>
          </>
        )}
        {state === 'done' && (
          <button className={styles.btnSecondary} onClick={reset}>Brew again</button>
        )}
      </div>
    </div>
  )
}
