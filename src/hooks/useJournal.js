import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'

const LOCAL_KEY = 'v60-journal-v2'

export function useJournal(user) {
  const [entries, setEntries] = useState([])

  // Load entries — from Supabase if logged in, localStorage if not
  useEffect(() => {
    if (user) {
      supabase
        .from('brews')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setEntries(data.map(fromSupabase))
        })
    } else {
      try {
        setEntries(JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'))
      } catch { setEntries([]) }
    }
  }, [user])

  // Save to localStorage whenever entries change (non-logged-in users)
  useEffect(() => {
    if (!user) {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(entries)) } catch {}
    }
  }, [entries, user])

  const addEntry = async (entry) => {
    if (user) {
      const { data, error } = await supabase
        .from('brews')
        .insert([toSupabase(entry, user.id)])
        .select()
        .single()
      if (!error && data) setEntries(prev => [fromSupabase(data), ...prev])
    } else {
      const newEntry = { ...entry, id: Date.now() }
      setEntries(prev => [newEntry, ...prev])
    }
  }

  const deleteEntry = async (id) => {
    if (user) {
      await supabase.from('brews').delete().eq('id', id)
    }
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 2, exported: new Date().toISOString(), entries }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `v60-journal-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const imported = data.entries || (Array.isArray(data) ? data : [])
        if (!imported.length) return reject(new Error('No entries found in file'))

        if (user) {
          const rows = imported.map(x => toSupabase(x, user.id))
          const { error } = await supabase.from('brews').upsert(rows)
          if (error) return reject(error)
          const { data: fresh } = await supabase
            .from('brews')
            .select('*')
            .order('created_at', { ascending: false })
          setEntries(fresh.map(fromSupabase))
        } else {
          setEntries(prev => {
            const existingIds = new Set(prev.map(x => x.id))
            const newOnes = imported.filter(x => !existingIds.has(x.id))
            return [...newOnes, ...prev].sort((a, b) => b.id - a.id)
          })
        }
        resolve(imported.length)
      } catch { reject(new Error('Invalid file format')) }
    }
    reader.readAsText(file)
  })

  return { entries, addEntry, deleteEntry, exportData, importData }
}

// Convert Supabase row → app entry
function fromSupabase(row) {
  return {
    id:           row.id,
    bean:         row.bean,
    roaster:      row.roaster || '',
    roast:        row.roast || '',
    grinder:      row.grinder || '',
    grindSetting: row.grind_setting || '',
    dose:         row.dose || '',
    water:        row.water || '',
    temp:         row.temp || '',
    drawdown:     row.drawdown || '',
    acidity:      row.acidity || 5,
    sweetness:    row.sweetness || 5,
    body:         row.body || 5,
    bitterness:   row.bitterness || 3,
    flavors:      row.flavors || [],
    rating:       row.rating || 0,
    notes:        row.notes || '',
    date:         new Date(row.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  }),
  }
}

// Convert app entry → Supabase row
function toSupabase(entry, userId) {
  return {
    user_id:       userId,
    bean:          entry.bean,
    roaster:       entry.roaster,
    roast:         entry.roast,
    grinder:       entry.grinder,
    grind_setting: entry.grindSetting,
    dose:          entry.dose,
    water:         entry.water,
    temp:          entry.temp,
    drawdown:      entry.drawdown,
    acidity:       entry.acidity,
    sweetness:     entry.sweetness,
    body:          entry.body,
    bitterness:    entry.bitterness,
    flavors:       entry.flavors,
    rating:        entry.rating,
    notes:         entry.notes,
  }
}
