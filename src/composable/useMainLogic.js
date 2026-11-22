import { ref, computed } from 'vue'
import { formatCurrency } from '../utils/currency'

export function useMainLogic(expenses, { addExpense, updateExpense, deleteExpense }) {
    const searchQuery = ref('')
    const showWeeklyTable = ref(false)
    const showForm = ref(false)
    const editingExpense = ref(null)
    const expenseToDelete = ref(null)
    const openMenu = ref(null)

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
        editingExpense.value = null
        showForm.value = true
    }

    const handleEditClick = (expense) => {
        editingExpense.value = expense
        showForm.value = true
    }

    const saveExpense = (data) => {
        if (editingExpense.value) {
            updateExpense(editingExpense.value.id, data)
        } else {
            addExpense(data)
        }
    }

    const handleDeleteClick = (expense) => {
        expenseToDelete.value = expense
    }

    const handleDeleteConfirm = () => {
        deleteExpense(expenseToDelete.value.id)
        expenseToDelete.value = null
    }

    const handleDeleteCancel = () => {
        expenseToDelete.value = null
    }

    const toggleMenu = (expense, anchor) => {
        openMenu.value = openMenu.value?.expense.id === expense.id ? null : { expense, anchor }
    }

    const closeMenu = () => {
        openMenu.value = null
    }

    const handleFormCancel = () => {
        showForm.value = false
    }

    const handleFormSubmit = () => {
        showForm.value = false
    }

    return {
        // State
        searchQuery,
        showWeeklyTable,
        showForm,
        editingExpense,
        expenseToDelete,
        openMenu,

        // Computed
        filteredExpenses,
        totalExpenses,

        // Methods
        formatCurrency,
        handleAddClick,
        handleEditClick,
        saveExpense,
        handleFormCancel,
        handleFormSubmit,
        handleDeleteClick,
        handleDeleteConfirm,
        handleDeleteCancel,
        toggleMenu,
        closeMenu
    }
}
