import { ref, watch, computed } from 'vue'

export function useStorage() {
  const STORAGE_KEY = 'expense-tracker-data'
  
  
  // Load expenses from localStorage or start with empty list
  const loadExpenses = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored expenses:', e)
        return []
      }
    }
    return []
  }

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
