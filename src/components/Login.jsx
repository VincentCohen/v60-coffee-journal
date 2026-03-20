import { useState } from 'react'
import { supabase } from '../supabase.js'
import Logo from './Logo.jsx'
import styles from './Login.module.css'

export default function Login({ onClose }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
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

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <Logo size={96} className={styles.logo} />
        <h1 className={styles.title}>
          <span className={styles.titleJust}>just </span>
          <span className={styles.titlePoured}>poured</span>
        </h1>

        {isSignUp ? <p className={styles.sub}>Create your account</p> : <p className={styles.sub}>Sign in to your account</p>}
        

        <div className={styles.fields}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
          />
        </div>

        {error   && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <button className={styles.btn} onClick={handle} disabled={loading}>
          {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        <button className={styles.toggle} onClick={() => setIsSignUp(s => !s)}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>

      </div>
    </div>
  )
}