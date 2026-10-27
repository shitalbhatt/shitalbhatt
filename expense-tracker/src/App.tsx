import { useEffect, useMemo, useState } from 'react'
import ExpenseForm from './ExpenseForm'
import { CATEGORIES, type Category, type Expense } from './types'
import {
  formatDay,
  formatMoney,
  loadExpenses,
  monthLabel,
  monthOf,
  saveExpenses,
  shiftMonth,
  todayISO,
  toCSV,
} from './lib'

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses)
  const [month, setMonth] = useState(monthOf(todayISO()))
  const [filter, setFilter] = useState<Category | 'All'>('All')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Expense | null>(null)

  useEffect(() => saveExpenses(expenses), [expenses])

  const inMonth = useMemo(() => expenses.filter((e) => monthOf(e.date) === month), [expenses, month])
  const total = inMonth.reduce((s, e) => s + e.cents, 0)

  const byCategory = useMemo(() => {
    const sums = new Map<Category, number>()
    for (const e of inMonth) sums.set(e.category, (sums.get(e.category) ?? 0) + e.cents)
    return CATEGORIES.map((c) => ({ c, cents: sums.get(c) ?? 0 }))
      .filter((x) => x.cents > 0)
      .sort((a, b) => b.cents - a.cents)
  }, [inMonth])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return inMonth
      .filter((e) => filter === 'All' || e.category === filter)
      .filter((e) => !q || e.description.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [inMonth, filter, search])

  const days = useMemo(() => {
    const groups: { date: string; items: Expense[] }[] = []
    for (const e of visible) {
      const last = groups[groups.length - 1]
      if (last?.date === e.date) last.items.push(e)
      else groups.push({ date: e.date, items: [e] })
    }
    return groups
  }, [visible])

  function save(e: Expense) {
    setExpenses((prev) =>
      prev.some((p) => p.id === e.id) ? prev.map((p) => (p.id === e.id ? e : p)) : [...prev, e],
    )
    setEditing(null)
    // Jump to the month of the saved expense so it is visible.
    setMonth(monthOf(e.date))
  }

  function remove(e: Expense) {
    if (!confirm(`Delete "${e.description}"?`)) return
    setExpenses((prev) => prev.filter((p) => p.id !== e.id))
    if (editing?.id === e.id) setEditing(null)
  }

  function exportCSV() {
    const blob = new Blob([toCSV(expenses)], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'expenses.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main>
      <header>
        <h1>Expense Tracker</h1>
        <button onClick={exportCSV} disabled={!expenses.length}>
          Export CSV
        </button>
      </header>

      <nav className="months" aria-label="Month">
        <button aria-label="Previous month" onClick={() => setMonth(shiftMonth(month, -1))}>
          ‹
        </button>
        <strong>{monthLabel(month)}</strong>
        <button aria-label="Next month" onClick={() => setMonth(shiftMonth(month, 1))}>
          ›
        </button>
      </nav>

      <section className="card summary" aria-label="Summary">
        <p className="muted">Total spent</p>
        <p className="total" data-testid="total">
          {formatMoney(total)}
        </p>
        {byCategory.length === 0 ? (
          <p className="muted">No spending this month.</p>
        ) : (
          <ul className="bars">
            {byCategory.map(({ c, cents }) => (
              <li key={c}>
                <span>{c}</span>
                <span className="bar">
                  <span style={{ width: `${(cents / total) * 100}%` }} />
                </span>
                <span>{formatMoney(cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ExpenseForm
        key={editing?.id ?? 'new'}
        editing={editing}
        onSubmit={save}
        onCancel={() => setEditing(null)}
      />

      <section aria-label="Expenses">
        <div className="row filters">
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="Filter by category"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Category | 'All')}
          >
            <option>All</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {days.length === 0 && <p className="muted empty">Nothing to show.</p>}
        {days.map(({ date, items }) => (
          <div key={date} className="day">
            <h3>{formatDay(date)}</h3>
            <ul className="list">
              {items.map((e) => (
                <li key={e.id} className="card item">
                  <div>
                    <div>{e.description}</div>
                    <small className="muted">{e.category}</small>
                  </div>
                  <div className="amount">{formatMoney(e.cents)}</div>
                  <div className="actions">
                    <button aria-label={`Edit ${e.description}`} onClick={() => setEditing(e)}>
                      Edit
                    </button>
                    <button aria-label={`Delete ${e.description}`} onClick={() => remove(e)}>
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  )
}
