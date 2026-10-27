import { useState, type FormEvent } from 'react'
import { CATEGORIES, type Category, type Expense } from './types'
import { newId, parseAmount, todayISO } from './lib'

interface Props {
  /** When set, the form edits this expense instead of creating one. */
  editing: Expense | null
  onSubmit: (e: Expense) => void
  onCancel: () => void
}

export default function ExpenseForm({ editing, onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState(editing ? (editing.cents / 100).toFixed(2) : '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [category, setCategory] = useState<Category>(editing?.category ?? 'Food')
  const [date, setDate] = useState(editing?.date ?? todayISO())
  const [error, setError] = useState('')

  function submit(ev: FormEvent) {
    ev.preventDefault()
    const cents = parseAmount(amount)
    if (cents === null) return setError('Enter an amount greater than 0 (max 2 decimals).')
    if (!description.trim()) return setError('Add a short description.')
    if (!date) return setError('Pick a date.')
    onSubmit({ id: editing?.id ?? newId(), cents, description: description.trim(), category, date })
    if (!editing) {
      setAmount('')
      setDescription('')
    }
    setError('')
  }

  return (
    <form className="card form" onSubmit={submit} aria-label={editing ? 'Edit expense' : 'Add expense'}>
      <h2>{editing ? 'Edit expense' : 'Add expense'}</h2>
      <div className="row">
        <label>
          Amount
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <label>
        Description
        <input
          placeholder="e.g. Groceries"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="row">
        <button type="submit" className="primary">
          {editing ? 'Save changes' : 'Add expense'}
        </button>
        {editing && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
