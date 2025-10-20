import { ref, watch, computed } from 'vue'

export function useStorage() {
  const STORAGE_KEY = 'expense-tracker-data'
  
  
  // Load expenses from localStorage or return default sample data
  const loadExpenses = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored expenses:', e)
        return getDefaultExpenses()
      }
    }
    return getDefaultExpenses()
  }

  const getDefaultExpenses = () => [
    { id: 1, date: '10/15/2025', description: 'Office supplies and equipment for team', amount: 245.50 },
    { id: 2, date: '10/14/2025', description: 'Client lunch meeting at downtown restaurant', amount: 89.00 },
    { id: 3, date: '10/13/2025', description: 'Software subscription renewal', amount: 299.99 },
    { id: 4, date: '10/12/2025', description: 'Transportation and parking fees', amount: 45.00 },
    { id: 5, date: '10/11/2025', description: 'Conference registration and materials', amount: 450.00 },
    { id: 6, date: '10/10/2025', description: 'Office rent payment for November', amount: 1200.00 },
    { id: 7, date: '10/09/2025', description: 'Marketing campaign expenses', amount: 675.25 },
    { id: 8, date: '10/08/2025', description: 'Utilities and internet service', amount: 156.80 },
  ]

  const expensesRaw = ref(loadExpenses())

  /**
   * Parse MM/DD/YYYY date string to Date object for comparison
   * @param {String} dateStr - Date string in MM/DD/YYYY format
   * @returns {Date} Date object
   */
  const parseDate = (dateStr) => {
    const [month, day, year] = dateStr.split('/')
    return new Date(year, month - 1, day)
  }

  // Computed property to return expenses sorted by date (descending - newest first)
  const expenses = computed(() => {
    return [...expensesRaw.value].sort((a, b) => {
      const dateA = parseDate(a.date)
      const dateB = parseDate(b.date)
      return dateB - dateA
    })
  })

  watch(
    expensesRaw,
    (newExpenses) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses))
    },
    { deep: true }
  )

  /**
   * Add a new expense
   * @param {Object} expense - Expense object with description and amount
   */
  const addExpense = (expense) => {
    const newExpense = {
      id: Date.now(),
      ...expense
    }
    expensesRaw.value.push(newExpense)
  }

  return {
    expenses,
    addExpense
  }
}
