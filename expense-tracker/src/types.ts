export const CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Health',
  'Entertainment',
  'Shopping',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Expense {
  id: string
  /** Amount in cents, avoids floating point drift. */
  cents: number
  description: string
  category: Category
  /** ISO date, YYYY-MM-DD. */
  date: string
}
