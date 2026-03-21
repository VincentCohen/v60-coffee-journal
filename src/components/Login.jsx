import { useState } from 'react'
import { supabase } from '../supabase.js'
import Logo from './Logo.jsx'
import styles from './Login.module.css'

export default function Login({ onClose }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [message, setMessage]   = useState(null)

  const handle = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else if (isSignUp) {
      setMessage('Check your email for a confirmation link!')
    }

    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email.trim()) { setError('Enter your email address first.'); return }
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://justpoured.app',
    })
    setLoading(false)
    if (error) setError(error.message)
    else setMessage('Check your email for a password reset link!')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <Logo size={72} className={styles.logo} />
        <h1 className={styles.title}>
          <span className={styles.titleJust}>just </span>
          <span className={styles.titlePoured}>poured</span>
        </h1>
        <p className={styles.tagline}>Coffee Journal</p>

        {isForgot
          ? <p className={styles.sub}>We'll send a reset link to your email.</p>
          : isSignUp
            ? <p className={styles.sub}>Create your account</p>
            : <p className={styles.sub}>Sign in to your account</p>
        }

        <div className={styles.fields}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {!isForgot && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
            />
          )}
        </div>

        {error   && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        {isForgot ? (
          <>
            <button className={styles.btn} onClick={handleForgot} disabled={loading}>
              {loading ? 'Please wait…' : 'Send reset link'}
            </button>
            <button className={styles.toggle} onClick={() => { setIsForgot(false); setError(null); setMessage(null) }}>
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <button className={styles.btn} onClick={handle} disabled={loading}>
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
            <button className={styles.toggle} onClick={() => setIsSignUp(s => !s)}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
            {!isSignUp && (
              <button className={styles.skip} onClick={() => { setIsForgot(true); setError(null); setMessage(null) }}>
                Forgot password?
              </button>
            )}
          </>
        )}

      </div>
    </div>
  )
}