import { computed } from 'vue'

const monthName = (monthIndex) => new Date(2000, monthIndex, 1).toLocaleString('en-US', { month: 'long' })

export function useMonthlyLogic(expenses, selectedYear) {
    const monthlyTotals = computed(() => {
        if (!selectedYear.value || !Array.isArray(expenses.value)) return []

        const totals = {}
        expenses.value.forEach(expense => {
            const date = new Date(expense.date)
            if (date.getFullYear() !== selectedYear.value) return

            const month = date.getMonth()
            totals[month] = (totals[month] ?? 0) + expense.amount
        })

        return Object.keys(totals)
            .map(Number)
            .sort((a, b) => a - b)
            .map(month => ({ month, name: monthName(month), total: totals[month] }))
    })

    const monthlyYearTotal = computed(() => {
        return monthlyTotals.value.reduce((sum, month) => sum + month.total, 0)
    })

    return {
        monthlyTotals,
        monthlyYearTotal
    }
}
