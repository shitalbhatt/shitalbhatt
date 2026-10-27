import { CATEGORIES, type Category, type Expense } from './types'

const KEY = 'expense-tracker:v1'

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data: unknown = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    return data.filter(isExpense)
  } catch {
    return []
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(expenses))
  } catch {
    // Storage full or unavailable (private mode); the app keeps working in memory.
  }
}

function isExpense(x: unknown): x is Expense {
  if (typeof x !== 'object' || x === null) return false
  const e = x as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.cents === 'number' &&
    Number.isFinite(e.cents) &&
    typeof e.description === 'string' &&
    typeof e.date === 'string' &&
    CATEGORIES.includes(e.category as Category)
  )
}

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })
export const formatMoney = (cents: number) => money.format(cents / 100)

/** Parses user input like "12", "12.5", "1,234.56" into cents; null if invalid or <= 0. */
export function parseAmount(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, '')
  if (!/^\d*\.?\d{0,2}$/.test(cleaned) || cleaned === '' || cleaned === '.') return null
  const cents = Math.round(parseFloat(cleaned) * 100)
  return cents > 0 ? cents : null
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const monthOf = (isoDate: string) => isoDate.slice(0, 7)

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function toCSV(expenses: Expense[]): string {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
  const rows = expenses.map((e) =>
    [e.date, esc(e.description), e.category, (e.cents / 100).toFixed(2)].join(','),
  )
  return ['date,description,category,amount', ...rows].join('\n')
}
