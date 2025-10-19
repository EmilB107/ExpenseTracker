import { ref, computed } from 'vue'

export function useFormLogic(addExpense, emit) {
    const formData = ref({
        date: '',
        description: '',
        amount: ''
    })

    const showConfirmation = ref(false)
    const selectedDate = ref(new Date())

    const errors = ref({
        date: '',
        description: '',
        amount: ''
    })

    const validateForm = () => {
        let isValid = true

        errors.value = {
            date: '',
            description: '',
            amount: ''
        }

        if (!formData.value.date) {
            errors.value.date = 'Date is required'
            isValid = false
        }

        if (!formData.value.description.trim()) {
            errors.value.description = 'Description is required'
            isValid = false
        }

        if (!formData.value.amount) {
            errors.value.amount = 'Amount is required'
            isValid = false
        } else if (isNaN(formData.value.amount) || parseFloat(formData.value.amount) <= 0) {
            errors.value.amount = 'Amount must be a positive number'
            isValid = false
        }

        return isValid
    }

    const isFormValid = computed(() => {
        return formData.value.date &&
            formData.value.description.trim() &&
            formData.value.amount &&
            !isNaN(formData.value.amount) &&
            parseFloat(formData.value.amount) > 0
    })

    const resetForm = () => {
        formData.value = {
            date: '',
            description: '',
            amount: ''
        }
        errors.value = {
            date: '',
            description: '',
            amount: ''
        }
        showConfirmation.value = false
    }

    const initializeDate = () => {
        selectedDate.value = new Date()
        updateFormDate()
    }

    const updateFormDate = () => {
        const date = selectedDate.value
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const year = date.getFullYear()
        formData.value.date = `${year}-${month}-${day}`
    }

    const formatDateForDisplay = (date) => {
        if (!date) return ''
        const d = new Date(date)
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const year = d.getFullYear()
        return `${month}/${day}/${year}`
    }

    const handleSubmit = () => {
        updateFormDate() // Ensure date is synced
        if (validateForm()) {
            showConfirmation.value = true
        }
    }

    const handleConfirmSubmit = () => {
        // Format date as MM/DD/YYYY
        const formattedDate = formatDateForDisplay(selectedDate.value)

        addExpense({
            date: formattedDate,
            description: formData.value.description,
            amount: parseFloat(formData.value.amount)
        })

        resetForm()
        showConfirmation.value = false
        emit('submit')
    }

    const handleCancelConfirmation = () => {
        showConfirmation.value = false
    }

    const handleCancel = () => {
        resetForm()
        selectedDate.value = new Date()
        emit('cancel')
    }

    const getMaxDate = () => {
        return new Date()
    }

    return {
        // State
        formData,
        errors,
        showConfirmation,
        selectedDate,

        // Computed
        isFormValid,

        // Methods
        validateForm,
        resetForm,
        initializeDate,
        updateFormDate,
        formatDateForDisplay,
        handleSubmit,
        handleConfirmSubmit,
        handleCancelConfirmation,
        handleCancel,
        getMaxDate
    }
}
