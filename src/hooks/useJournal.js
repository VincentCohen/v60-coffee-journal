import { useState, useEffect } from 'react'

const KEY = 'v60-journal-v2'

export function useJournal() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(entries)) } catch {}
  }, [entries])

  const addEntry  = (e) => setEntries(p => [{ ...e, id: Date.now() }, ...p])
  const deleteEntry = (id) => setEntries(p => p.filter(e => e.id !== id))

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 2, exported: new Date().toISOString(), entries }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `v60-journal-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const imported = data.entries || (Array.isArray(data) ? data : [])
        if (!imported.length) return reject(new Error('No entries found in file'))
        setEntries(prev => {
          const existingIds = new Set(prev.map(x => x.id))
          const newOnes = imported.filter(x => !existingIds.has(x.id))
          return [...newOnes, ...prev].sort((a, b) => b.id - a.id)
        })
        resolve(imported.length)
      } catch { reject(new Error('Invalid file format')) }
    }
    reader.readAsText(file)
  })

  return { entries, addEntry, deleteEntry, exportData, importData }
}
