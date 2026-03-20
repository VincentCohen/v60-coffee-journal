import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'

const ACTIVE_RECIPE_KEY = 'v60-active-recipe-id'

export function useJournal(user) {
  const [entries,       setEntries]       = useState([])
  const [beans,         setBeans]         = useState([])
  const [recipes,       setRecipes]       = useState([])
  const [activeRecipeId, setActiveRecipeId] = useState(() => localStorage.getItem(ACTIVE_RECIPE_KEY) || null)
  const [loaded,        setLoaded]        = useState(false)

  useEffect(() => {
    if (!user) { setEntries([]); setBeans([]); setRecipes([]); setLoaded(true); return }

    Promise.all([
      supabase.from('brews').select('*').order('created_at', { ascending: false }),
      supabase.from('beans').select('*').order('created_at', { ascending: false }),
      supabase.from('recipes').select('*').order('created_at', { ascending: true }),
    ]).then(([{ data: brews, error: brewErr }, { data: beanRows, error: beanErr }, { data: recipeRows, error: recipeErr }]) => {
      if (!brewErr && brews) setEntries(brews.map(fromSupabase))
      if (!beanErr && beanRows) setBeans(beanRows.map(fromSupabaseBean))
      if (!recipeErr && recipeRows) setRecipes(recipeRows.map(fromSupabaseRecipe))
      setLoaded(true)
    })
  }, [user])

  // ── Brews ──────────────────────────────────────────────

  const addEntry = async (entry) => {
    if (!user) return
    const { data, error } = await supabase
      .from('brews')
      .insert([toSupabase(entry, user.id)])
      .select()
      .single()
    if (!error && data) setEntries(prev => [fromSupabase(data), ...prev])
  }

  const deleteEntry = async (id) => {
    if (!user) return
    await supabase.from('brews').delete().eq('id', id)
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
    a.download = `justpoured-${new Date().toISOString().slice(0, 10)}.json`
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

        const rows = imported.map(x => toSupabase(x, user.id))
        const { error } = await supabase.from('brews').upsert(rows)
        if (error) return reject(error)

        const { data: fresh } = await supabase
          .from('brews').select('*').order('created_at', { ascending: false })
        setEntries(fresh.map(fromSupabase))
        resolve(imported.length)
      } catch { reject(new Error('Invalid file format')) }
    }
    reader.readAsText(file)
  })

  const getBeanMemory = (beanName, roaster = '') => {
    if (!beanName.trim()) return null
    const lowerBean = beanName.toLowerCase()
    const lowerRoaster = roaster.toLowerCase()
    const match = entries.find(e => {
      const beanMatch = e.bean.toLowerCase().includes(lowerBean) || lowerBean.includes(e.bean.toLowerCase())
      const roasterMatch = !lowerRoaster || !e.roaster || e.roaster.toLowerCase().includes(lowerRoaster) || lowerRoaster.includes(e.roaster.toLowerCase())
      return beanMatch && roasterMatch
    })
    if (!match || (!match.grinder && !match.grindSetting)) return null
    return { bean: match.bean, roaster: match.roaster, roast: match.roast, grinder: match.grinder, grindSetting: match.grindSetting }
  }

  // ── Beans CRUD ─────────────────────────────────────────

  const addBean = async (bean) => {
    if (!user) return
    const { data, error } = await supabase
      .from('beans')
      .insert([toSupabaseBean(bean, user.id)])
      .select()
      .single()
    if (!error && data) setBeans(prev => [fromSupabaseBean(data), ...prev])
    return { data: data ? fromSupabaseBean(data) : null, error }
  }

  const updateBean = async (id, updates) => {
    if (!user) return
    const { data, error } = await supabase
      .from('beans')
      .update(toSupabaseBean(updates))
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setBeans(prev => prev.map(b => b.id === id ? fromSupabaseBean(data) : b))
    return { data: data ? fromSupabaseBean(data) : null, error }
  }

  const deleteBean = async (id) => {
    if (!user) return
    await supabase.from('beans').delete().eq('id', id)
    setBeans(prev => prev.filter(b => b.id !== id))
  }

  // ── Recipes CRUD ───────────────────────────────────────

  const addRecipe = async (recipe) => {
    if (!user) return
    const { data, error } = await supabase
      .from('recipes')
      .insert([toSupabaseRecipe(recipe, user.id)])
      .select()
      .single()
    if (!error && data) setRecipes(prev => [...prev, fromSupabaseRecipe(data)])
    return { data: data ? fromSupabaseRecipe(data) : null, error }
  }

  const updateRecipe = async (id, updates) => {
    if (!user) return
    const { data, error } = await supabase
      .from('recipes')
      .update(toSupabaseRecipe(updates))
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setRecipes(prev => prev.map(r => r.id === id ? fromSupabaseRecipe(data) : r))
    return { data: data ? fromSupabaseRecipe(data) : null, error }
  }

  const deleteRecipe = async (id) => {
    if (!user) return
    await supabase.from('recipes').delete().eq('id', id)
    setRecipes(prev => prev.filter(r => r.id !== id))
    if (activeRecipeId === id) setActiveRecipe(null)
  }

  const setActiveRecipe = (id) => {
    setActiveRecipeId(id)
    if (id) localStorage.setItem(ACTIVE_RECIPE_KEY, id)
    else localStorage.removeItem(ACTIVE_RECIPE_KEY)
  }

  return { entries, beans, recipes, activeRecipeId, loaded, addEntry, deleteEntry, exportData, importData, getBeanMemory, addBean, updateBean, deleteBean, addRecipe, updateRecipe, deleteRecipe, setActiveRecipe }
}

// ── Brews mapping ──────────────────────────────────────

function fromSupabase(row) {
  return {
    id:           row.id,
    beanId:       row.bean_id || null,
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
    createdAt:    row.created_at,
  }
}

function toSupabase(entry, userId) {
  return {
    user_id:       userId,
    bean_id:       entry.beanId || null,
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

// ── Beans mapping ──────────────────────────────────────

function fromSupabaseBean(row) {
  return {
    id:            row.id,
    name:          row.name,
    roaster:       row.roaster || '',
    origin:        row.origin || '',
    process:       row.process || '',
    varietal:      row.varietal || '',
    roastLevel:    row.roast_level || '',
    roastDate:     row.roast_date || null,
    purchaseDate:  row.purchase_date || null,
    weightG:       row.weight_g ?? null,
    price:         row.price_idr ?? null,
    currency:      row.currency || 'USD',
    stockAdjustG:  row.stock_adjust_g ?? null,
    notes:         row.notes || '',
    createdAt:     row.created_at,
  }
}

// ── Recipes mapping ────────────────────────────────────

function fromSupabaseRecipe(row) {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description || '',
    doseG:       row.dose_g ?? 15,
    waterG:      row.water_g ?? 250,
    tempC:       row.temp_c ?? 94,
    steps:       row.steps || [],
    createdAt:   row.created_at,
  }
}

function toSupabaseRecipe(recipe, userId) {
  const row = {
    name:        recipe.name,
    description: recipe.description || null,
    dose_g:      recipe.doseG != null ? Number(recipe.doseG) : 15,
    water_g:     recipe.waterG != null ? Number(recipe.waterG) : 250,
    temp_c:      recipe.tempC != null ? Number(recipe.tempC) : 94,
    steps:       recipe.steps || [],
  }
  if (userId) row.user_id = userId
  return row
}

function toSupabaseBean(bean, userId) {
  const row = {
    name:          bean.name,
    roaster:       bean.roaster || null,
    origin:        bean.origin || null,
    process:       bean.process || null,
    varietal:      bean.varietal || null,
    roast_level:   bean.roastLevel || null,
    roast_date:    bean.roastDate || null,
    purchase_date: bean.purchaseDate || null,
    weight_g:      bean.weightG ? Number(bean.weightG) : null,
    price_idr:     bean.priceIdr ? Number(bean.priceIdr) : null,
    notes:          bean.notes || null,
    price_idr:      bean.price != null ? Number(bean.price) : null,
    currency:       bean.currency || 'USD',
    stock_adjust_g: bean.stockAdjustG != null ? Number(bean.stockAdjustG) : null,
  }
  if (userId) row.user_id = userId
  return row
}
