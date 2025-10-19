import { ref, computed } from 'vue'

export function useMainLogic(expenses) {
    const searchQuery = ref('')

    const filteredExpenses = computed(() => {
        if (!searchQuery.value) return expenses.value

        const query = searchQuery.value.toLowerCase()
        return expenses.value.filter(expense =>
            expense.description.toLowerCase().includes(query)
        )
    })

    const totalExpenses = computed(() => {
        return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0)
    })

    /**
     * Format currency with peso sign and thousand separators
     * @param {Number} amount - Amount to format
     * @returns {String} Formatted currency string
     */
    const formatCurrency = (amount) => {
        return '₱' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    }

    return {
        searchQuery,

        filteredExpenses,
        totalExpenses,

        formatCurrency
    }
}
