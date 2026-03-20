import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BeanForm from './BeanForm.jsx'
import styles from './Beans.module.css'

function getFreshness(roastDate) {
  if (!roastDate) return null
  const days = Math.floor((Date.now() - new Date(roastDate)) / 86400000)
  if (days < 7)  return { label: 'Too fresh',    color: 'gray',   days }
  if (days <= 21) return { label: 'Peak freshness', color: 'green', days }
  if (days <= 45) return { label: 'Good',          color: 'yellow', days }
  return              { label: 'Past prime',      color: 'red',    days }
}

function getStock(bean, entries) {
  if (!bean.weightG && bean.stockAdjustG == null) return null
  if (bean.stockAdjustG != null) {
    return { remaining: bean.stockAdjustG, total: bean.weightG || bean.stockAdjustG, adjusted: true }
  }
  const used = entries
    .filter(e => e.beanId === bean.id)
    .reduce((sum, e) => sum + (parseFloat(e.dose) || 0), 0)
  return { remaining: bean.weightG - used, total: bean.weightG, adjusted: false }
}

function BeanCard({ bean, entries, onClick, onDelete }) {
  const freshness = getFreshness(bean.roastDate)
  const stock = getStock(bean, entries)
  const linkedBrews = entries.filter(e => e.beanId === bean.id)
  const lastBrew = linkedBrews[0]

  const meta = [bean.roaster, bean.origin, bean.process].filter(Boolean).join(' · ')

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardTop}>
        <div className={styles.cardTitle}>
          <span>{bean.name}</span>
          {freshness && (
            <span className={`${styles.badge} ${styles[`badge_${freshness.color}`]}`}>
              {freshness.label}
            </span>
          )}
        </div>
        <button
          className={styles.deleteBtn}
          onClick={e => { e.stopPropagation(); onDelete(bean.id) }}
          aria-label="Delete bean"
        >🗑</button>
      </div>

      {meta && <p className={styles.cardMeta}>{meta}</p>}

      <div className={styles.chips}>
        {bean.roastDate && (
          <span className={styles.chip}>
            Roast: {new Date(bean.roastDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
        {stock !== null && (
          <span className={`${styles.chip} ${stock.remaining <= 0 ? styles.chipEmpty : ''}`}>
            Stock: {Math.max(0, stock.remaining)}g / {stock.total}g
          </span>
        )}
      </div>

      <p className={styles.cardBrews}>
        {linkedBrews.length} {linkedBrews.length === 1 ? 'brew' : 'brews'}
        {lastBrew && ` · Last: ${lastBrew.date}`}
      </p>

      {bean.notes && <p className={styles.cardNotes}>{bean.notes}</p>}
    </div>
  )
}

function BeanDetail({ bean, entries, onBrewWith, onEdit, onDelete, onBack, onUpdate }) {
  const freshness = getFreshness(bean.roastDate)
  const stock = getStock(bean, entries)
  const [adjusting, setAdjusting] = useState(false)
  const [adjustVal, setAdjustVal] = useState('')
  const linkedBrews = entries.filter(e => e.beanId === bean.id)

  const methodCounts = linkedBrews.reduce((acc, e) => {
    if (e.bean) acc[e.bean] = (acc[e.bean] || 0) + 1
    return acc
  }, {})
  // top method from brew entries — use a simple count of grinder/notes proxy; just show V60 for now
  const topMethod = 'V60'

  const tagsMeta = [
    bean.origin  && { icon: '📍', label: bean.origin },
    bean.process && { icon: '⚙️', label: bean.process },
  ].filter(Boolean)

  return (
    <div className={styles.detail}>
      <button className={styles.backBtn} onClick={onBack}>← Back</button>

      <div className={styles.detailCard}>
        <div className={styles.detailHeader}>
          <div>
            <h2 className={styles.detailName}>{bean.name}</h2>
            {bean.roaster && <p className={styles.detailRoaster}>{bean.roaster}</p>}
          </div>
          {freshness && (
            <span className={`${styles.badge} ${styles[`badge_${freshness.color}`]}`}>
              {freshness.label}
            </span>
          )}
        </div>

        {tagsMeta.length > 0 && (
          <div className={styles.tagRow}>
            {tagsMeta.map(t => (
              <span key={t.label} className={styles.tag}>{t.icon} {t.label}</span>
            ))}
          </div>
        )}

        {freshness && (
          <p className={styles.daysAgo}>Roasted {freshness.days} day{freshness.days !== 1 ? 's' : ''} ago</p>
        )}

        <div className={styles.detailActions}>
          <button className={styles.brewBtn} onClick={() => onBrewWith(bean)}>Brew with this bean</button>
          <button className={styles.editBtn} onClick={() => onEdit(bean)}>Edit</button>
          <button className={styles.dangerBtn} onClick={() => onDelete(bean.id)}>Delete</button>
        </div>
      </div>

      {stock !== null && (
        <div className={styles.detailCard}>
          <div className={styles.stockHeader}>
            <span className={styles.sectionTitle}>Stock</span>
            {stock.remaining <= 0 && (
              <span className={`${styles.badge} ${styles.badge_red}`}>Out of Stock</span>
            )}
          </div>
          <p className={styles.stockAmount}>
            <strong>{Math.max(0, stock.remaining)}g</strong>
            <span> / {stock.total}g</span>
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.max(0, Math.min(100, (stock.remaining / stock.total) * 100))}%` }}
            />
          </div>

          {adjusting ? (
            <div className={styles.adjustRow}>
              <input
                type="number"
                min="0"
                autoFocus
                placeholder="Current stock (g)"
                value={adjustVal}
                onChange={e => setAdjustVal(e.target.value)}
              />
              <button className={styles.adjustSave} onClick={async () => {
                await onUpdate(bean.id, { ...bean, stockAdjustG: adjustVal === '' ? null : Number(adjustVal) })
                setAdjusting(false)
              }}>Save</button>
              <button className={styles.adjustCancel} onClick={() => setAdjusting(false)}>Cancel</button>
            </div>
          ) : (
            <button className={styles.adjustBtn} onClick={() => { setAdjustVal(String(Math.max(0, stock.remaining))); setAdjusting(true) }}>
              ⚖ Adjust Stock
            </button>
          )}

          {!stock.adjusted && (
            <p className={styles.stockNote}>
              Stock calculated from brew logs. Use Adjust Stock to correct it.
            </p>
          )}
          {stock.adjusted && (
            <p className={styles.stockNote}>
              Stock manually adjusted. <button className={styles.resetStock} onClick={() => onUpdate(bean.id, { ...bean, stockAdjustG: null })}>Reset to calculated</button>
            </p>
          )}
        </div>
      )}

      {linkedBrews.length > 0 && (
        <div className={styles.detailCard}>
          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{linkedBrews.length}</span>
              <span className={styles.statLbl}>Total Brews</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{topMethod}</span>
              <span className={styles.statLbl}>Top Method</span>
            </div>
          </div>
        </div>
      )}

      {linkedBrews.length > 0 && (
        <div className={styles.detailCard}>
          <p className={styles.sectionTitle}>Recent Brews</p>
          <div className={styles.recentBrews}>
            {linkedBrews.slice(0, 5).map(brew => (
              <div key={brew.id} className={styles.recentBrew}>
                <span className={styles.recentBrewMethod}>V60</span>
                <span className={styles.recentBrewMeta}>
                  {brew.date}
                  {brew.dose && ` · ${brew.dose}g`}
                  {brew.drawdown && ` · ${brew.drawdown}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {bean.notes && (
        <div className={styles.detailCard}>
          <p className={styles.sectionTitle}>Notes</p>
          <p className={styles.detailNotes}>{bean.notes}</p>
        </div>
      )}
    </div>
  )
}

export default function Beans({ beans, entries, onAdd, onUpdate, onDelete, onBrewWith }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editBean, setEditBean] = useState(null)
  const [search, setSearch]     = useState('')
  const [sort, setSort]         = useState('newest')

  const handleDelete = async (beanId) => {
    if (!confirm('Delete this bean?')) return
    await onDelete(beanId)
    navigate('/beans')
  }

  const handleEdit = (bean) => {
    setEditBean(bean)
    setShowForm(true)
  }

  const handleFormSave = async (data) => {
    if (editBean) {
      await onUpdate(editBean.id, data)
    } else {
      await onAdd(data)
    }
    setShowForm(false)
    setEditBean(null)
  }

  const filtered = beans
    .filter(b => {
      if (!search) return true
      const q = search.toLowerCase()
      return b.name.toLowerCase().includes(q) || (b.roaster || '').toLowerCase().includes(q) || (b.origin || '').toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (sort === 'az')    return a.name.localeCompare(b.name)
      if (sort === 'roast') return (b.roastDate || '').localeCompare(a.roastDate || '')
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  if (showForm) return (
    <BeanForm
      bean={editBean}
      onSave={handleFormSave}
      onCancel={() => { setShowForm(false); setEditBean(null) }}
    />
  )

  if (id) {
    const bean = beans.find(b => b.id === id)
    if (!bean) return <div style={{ padding: '2rem', color: 'var(--text-2)' }}>Bean not found.</div>
    return (
      <BeanDetail
        bean={bean}
        entries={entries}
        onBrewWith={onBrewWith}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={() => navigate('/beans')}
        onUpdate={onUpdate}
      />
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Beans</h2>
        <button className={styles.newBtn} onClick={() => { setEditBean(null); setShowForm(true) }} >
          New Bean
        </button>
      </div>

      <div className={styles.toolbar}>
        <select value={sort} onChange={e => setSort(e.target.value)} className={styles.sortSelect}>
          <option value="newest">Newest</option>
          <option value="az">A–Z</option>
          <option value="roast">Roast date</option>
        </select>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search beans..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🫘</span>
          <h3>No beans yet</h3>
          <p>Add your first bean to start tracking freshness and stock.</p>
          <button className={styles.emptyCta} onClick={() => setShowForm(true)}>Add a bean</button>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(bean => (
            <BeanCard
              key={bean.id}
              bean={bean}
              entries={entries}
              onClick={() => navigate(`/beans/${bean.id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
