import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './BrewTimer.module.css'

const STEPS = [
  { label: 'Bloom',        cue: 'Pour 50 g — slow spiral, saturate all grounds', target: 45,  pour: '→ 50 g',  colour: '#a07850' },
  { label: 'First pour',   cue: 'Pour steadily to 150 g — gentle continuous spiral', target: 45, pour: '→ 150 g', colour: '#8a6240' },
  { label: 'Second pour',  cue: 'Pour to 250 g — slow and steady to finish', target: 60, pour: '→ 250 g', colour: '#6b4e2e' },
  { label: 'Drawdown',     cue: 'Swirl the dripper gently, then wait for full drawdown', target: 90, pour: null,    colour: '#3d2a14' },
]

const TOTAL = STEPS.reduce((s, x) => s + x.target, 0) // 240s = 4:00

function fmt(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function BrewTimer({ onDone } = {}) {
  const [state, setState]   = useState('idle')   // idle | running | paused | done
  const [elapsed, setElapsed] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [stepElapsed, setStepElapsed] = useState(0)
  const intervalRef = useRef(null)
  const startRef    = useRef(null)
  const baseRef     = useRef(0)

  const currentStep = STEPS[Math.min(stepIdx, STEPS.length - 1)]

  const tick = useCallback(() => {
    const now  = Date.now()
    const total = baseRef.current + Math.floor((now - startRef.current) / 1000)
    const clamped = Math.min(total, TOTAL)
    setElapsed(clamped)

    // which step are we in?
    let acc = 0
    for (let i = 0; i < STEPS.length; i++)
    {
      if (clamped < acc + STEPS[i].target)
      {
        setStepIdx(i)
        setStepElapsed(clamped - acc)
        break
      }

      acc += STEPS[i].target
    }

    if (clamped >= TOTAL)
    {
      clearInterval(intervalRef.current)
     
      setState('done')
     
      onDone?.()
    }
  }, [])

  const start = () => {
    startRef.current = Date.now()
    baseRef.current  = elapsed
    intervalRef.current = setInterval(tick, 250)

    setState('running')
  }

  const pause = () => {
    clearInterval(intervalRef.current)
    baseRef.current = elapsed

    setState('paused')
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setState('idle')
    setElapsed(0)
    setStepIdx(0)
    setStepElapsed(0)
    baseRef.current = 0
  }

  const skipStep = () => {
    if (stepIdx >= STEPS.length - 1)
    { 
      return
    }

    const nextStepStart = STEPS.slice(0, stepIdx + 1).reduce((a, x) => a + x.target, 0)
    baseRef.current = nextStepStart
    startRef.current = Date.now()

    setElapsed(nextStepStart)
    setStepIdx(stepIdx + 1)
    setStepElapsed(0)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  // step progress ring
  const stepProgress = stepElapsed / currentStep.target
  const R = 54
  const CIRC = 2 * Math.PI * R
  const dash = CIRC * (1 - stepProgress)

  // total arc (thin outer)
  const totalProgress = elapsed / TOTAL
  const dashTotal = CIRC * (1 - totalProgress)

  return (
    <div className={styles.wrap}>
      {/* Big ring */}
      <div className={styles.ring}>
        <svg viewBox="0 0 128 128" className={styles.svg}>
          {/* background track */}
          <circle cx="64" cy="64" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
          {/* total progress (thin) */}
          <circle cx="64" cy="64" r={R} fill="none" stroke="var(--c200)" strokeWidth="2"
            strokeDasharray={CIRC} strokeDashoffset={dashTotal}
            strokeLinecap="round" transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset .25s linear' }} />
          {/* step progress (thick) */}
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
              <span className={styles.elapsed}>{fmt(elapsed)}</span>
              <span className={styles.total}>/ {fmt(TOTAL)}</span>
            </>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className={styles.stepDots}>
        {STEPS.map((s, i) => (
          <div key={i} className={`${styles.dot} ${i < stepIdx ? styles.dotDone : ''} ${i === stepIdx && state !== 'idle' && state !== 'done' ? styles.dotActive : ''}`} />
        ))}
      </div>

      {/* Current step card */}
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

      {/* Step timeline */}
      <div className={styles.timeline}>
        {STEPS.map((s, i) => {
          const start = STEPS.slice(0, i).reduce((a, x) => a + x.target, 0)
          const done = elapsed >= start + s.target
          const active = i === stepIdx && state !== 'idle' && state !== 'done'
          return (
            <div key={i} className={`${styles.timelineItem} ${done ? styles.timelineDone : ''} ${active ? styles.timelineActive : ''}`}>
              <span className={styles.timelineLabel}>{s.label}</span>
              <span className={styles.timelineTime}>{fmt(start)}</span>
            </div>
          )
        })}
      </div>

      {/* Controls */}
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
            <button className={styles.btnPrimary} onClick={start}>Resume</button>
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
