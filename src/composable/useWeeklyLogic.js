import { ref, computed, watch } from 'vue'

export function useWeeklyLogic(expenses) {
    const selectedYear = ref(null)

    // Get all unique years from expenses
    const availableYears = computed(() => {
        if (!expenses.value || !Array.isArray(expenses.value)) {
            return []
        }
        const years = expenses.value.map(expense => {
            const date = new Date(expense.date)
            return date.getFullYear()
        })
        return [...new Set(years)].sort((a, b) => b - a) // Descending order
    })

    // Watch for availableYears and set default to the latest year
    watch(availableYears, (years) => {
        if (years.length > 0 && !selectedYear.value) {
            selectedYear.value = years[0]
        }
    }, { immediate: true })

    /**
     * Get week number for a given date based on ISO 8601
     * Returns {year, week} to handle cross-year weeks
     */
    const getWeekNumber = (date) => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        const dayNum = d.getUTCDay() || 7
        d.setUTCDate(d.getUTCDate() + 4 - dayNum)
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
        return { year: d.getUTCFullYear(), week: weekNo }
    }

    // Get total weeks that belong to a specific year (ISO 8601)
    const getTotalWeeksInYear = (year) => {
        // Check if Dec 28 (which always belongs to the last week of the year) belongs to this year
        const dec28 = new Date(year, 11, 28)
        const weekInfo = getWeekNumber(dec28)
        return weekInfo.week
    }

    /**
     * Get the date range (start and end) for a given week number in a year
     * Returns {start: Date, end: Date}
     */
    const getWeekDateRange = (year, weekNum) => {
        // Start from Jan 4th (which is always in week 1 of the year)
        const jan4 = new Date(Date.UTC(year, 0, 4))
        const jan4Day = jan4.getUTCDay() || 7

        // Find the Monday of week 1
        const week1Monday = new Date(jan4)
        week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1)

        // Calculate the Monday of the target week
        const weekMonday = new Date(week1Monday)
        weekMonday.setUTCDate(week1Monday.getUTCDate() + (weekNum - 1) * 7)

        // Calculate the Sunday of the target week
        const weekSunday = new Date(weekMonday)
        weekSunday.setUTCDate(weekMonday.getUTCDate() + 6)

        return {
            start: weekMonday,
            end: weekSunday
        }
    }

    // Format date as MM/DD/YYYY
    const formatDate = (date) => {
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        const year = date.getUTCFullYear()
        return `${month}/${day}/${year}`
    }

    // Calculate weekly totals for selected year
    const weeklyTotals = computed(() => {
        if (!selectedYear.value) return []
        if (!expenses.value || !Array.isArray(expenses.value)) {
            return []
        }

        // Filter expenses for selected year
        const yearExpenses = expenses.value.filter(expense => {
            const date = new Date(expense.date)
            return date.getFullYear() === selectedYear.value
        })

        // Group expenses by week number
        const weeklyData = {}
        yearExpenses.forEach(expense => {
            const date = new Date(expense.date)
            const weekInfo = getWeekNumber(date)

            // Only include expenses where the week belongs to the selected year
            if (weekInfo.year === selectedYear.value) {
                const weekNum = weekInfo.week

                if (!weeklyData[weekNum]) {
                    weeklyData[weekNum] = 0
                }
                weeklyData[weekNum] += expense.amount
            }
        })

        // Get total number of weeks in the year
        const totalWeeks = getTotalWeeksInYear(selectedYear.value)

        // Create array with all weeks (including weeks with 0 expenses)
        const result = []
        for (let week = 1; week <= totalWeeks; week++) {
            const dateRange = getWeekDateRange(selectedYear.value, week)
            result.push({
                week,
                total: weeklyData[week] || 0,
                startDate: formatDate(dateRange.start),
                endDate: formatDate(dateRange.end)
            })
        }

        return result
    })

    // Total of all weekly expenses for the year
    const yearlyTotal = computed(() => {
        return weeklyTotals.value.reduce((sum, week) => sum + week.total, 0)
    })

    // Format currency with peso sign and thousand separators
    const formatCurrency = (amount) => {
        return '₱' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    }

    return {
        selectedYear,
        availableYears,
        weeklyTotals,
        yearlyTotal,
        formatCurrency
    }
}
