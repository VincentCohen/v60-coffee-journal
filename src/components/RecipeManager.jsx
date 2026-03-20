import { useState } from 'react'
import { JH_RECIPE } from '../defaultRecipe.js'
import RecipeForm from './RecipeForm.jsx'
import styles from './RecipeManager.module.css'

function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function RecipeCard({ recipe, isActive, onActivate, onEdit, onDelete }) {
  const totalSecs = recipe.steps.reduce((s, x) => s + x.duration, 0)
  const isBuiltIn = recipe.id === '__jh_default__'

  return (
    <div className={`${styles.card} ${isActive ? styles.cardActive : ''}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardMeta}>
          <span className={styles.cardName}>{recipe.name}</span>
          {isActive && <span className={styles.activeBadge}>Active</span>}
        </div>
        {!isBuiltIn && (
          <div className={styles.cardActions}>
            <button className={styles.iconBtn} onClick={() => onEdit(recipe)}>✏️</button>
            <button className={styles.iconBtn} onClick={() => onDelete(recipe.id)}>🗑</button>
          </div>
        )}
      </div>

      <div className={styles.cardStats}>
        <span>{recipe.steps.length} steps · {fmt(totalSecs)}</span>
        <span>{recipe.doseG}g · {recipe.waterG}g · {recipe.tempC}°C</span>
      </div>

      {recipe.description && <p className={styles.cardDesc}>{recipe.description}</p>}

      <div className={styles.cardSteps}>
        {recipe.steps.map((s, i) => (
          <div key={i} className={styles.stepRow}>
            <span className={styles.stepLabel}>{s.label}</span>
            <span className={styles.stepMeta}>
              {fmt(s.duration)}
              {s.pourTarget != null && ` · → ${s.pourTarget}g`}
            </span>
          </div>
        ))}
      </div>

      {!isActive && (
        <button className={styles.activateBtn} onClick={() => onActivate(recipe.id)}>
          Use this recipe
        </button>
      )}
    </div>
  )
}

export default function RecipeManager({ recipes, activeRecipeId, onAdd, onUpdate, onDelete, onActivate }) {
  const [showForm, setShowForm] = useState(false)
  const [editRecipe, setEditRecipe] = useState(null)

  const allRecipes = [JH_RECIPE, ...recipes]
  const effectiveActiveId = activeRecipeId && allRecipes.find(r => r.id === activeRecipeId)
    ? activeRecipeId
    : JH_RECIPE.id

  const handleEdit = (recipe) => {
    setEditRecipe(recipe)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this recipe?')) return
    await onDelete(id)
  }

  const handleFormSave = async (data) => {
    if (editRecipe) {
      await onUpdate(editRecipe.id, data)
    } else {
      await onAdd(data)
    }
    setShowForm(false)
    setEditRecipe(null)
  }

  if (showForm) return (
    <RecipeForm
      recipe={editRecipe}
      onSave={handleFormSave}
      onCancel={() => { setShowForm(false); setEditRecipe(null) }}
    />
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recipes</h2>
        <button className={styles.newBtn} onClick={() => { setEditRecipe(null); setShowForm(true) }}>
          New Recipe
        </button>
      </div>

      <div className={styles.list}>
        {allRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isActive={recipe.id === effectiveActiveId}
            onActivate={onActivate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
