import { ref, computed } from 'vue'

export function useMainLogic(expenses) {
    const searchQuery = ref('')
    const showWeeklyTable = ref(false)
    const showForm = ref(false)

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

    const handleAddClick = () => {
        showForm.value = true
    }

    const handleFormCancel = () => {
        showForm.value = false
        searchQuery.value = ''
        showWeeklyTable.value = false
    }

    const handleFormSubmit = () => {
        showForm.value = false
        searchQuery.value = ''
        showWeeklyTable.value = false
    }

    return {
        // State
        searchQuery,
        showWeeklyTable,
        showForm,

        // Computed
        filteredExpenses,
        totalExpenses,

        // Methods
        formatCurrency,
        handleAddClick,
        handleFormCancel,
        handleFormSubmit
    }
}
