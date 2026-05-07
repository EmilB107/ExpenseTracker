import { ref, computed } from 'vue'
import { formatCurrency } from '../utils/currency'

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
