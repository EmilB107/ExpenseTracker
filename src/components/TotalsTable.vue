<script setup>
import { ref, toRef } from 'vue'
import { useWeeklyLogic } from '../composable/useWeeklyLogic'
import { useMonthlyLogic } from '../composable/useMonthlyLogic'

// Receive expenses as a prop from parent
const props = defineProps({
  expenses: {
    type: Array,
    required: true
  }
})

// Convert the unwrapped prop back to a ref for useWeeklyLogic
const expensesRef = toRef(props, 'expenses')

const {
  selectedYear,
  availableYears,
  weeklyTotals,
  yearlyTotal,
  formatCurrency
} = useWeeklyLogic(expensesRef)

const { monthlyTotals, monthlyYearTotal } = useMonthlyLogic(expensesRef, selectedYear)

const view = ref('monthly')
const views = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' }
]
</script>

<template>
  <div class="max-w-6xl lg:max-w-1/2 mx-auto">
    <p v-if="availableYears.length === 0"
      class="border-2 border-gray-800 rounded-lg px-6 py-4 text-center text-sm text-gray-500">
      No expenses yet. Add one to see your totals.
    </p>

    <template v-else>
      <div class="mb-6">
        <div class="flex flex-wrap gap-3 items-center text-sm">
          <div role="group" aria-label="Group totals by" class="flex rounded-full border-2 border-gray-800 p-0.5">
            <button v-for="option in views" :key="option.value" type="button" @click="view = option.value"
              :aria-pressed="view === option.value"
              class="px-4 py-2 rounded-full font-medium transition-colors"
              :class="view === option.value ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'">
              {{ option.label }}
            </button>
          </div>
          <select
            v-model="selectedYear"
            aria-label="Year"
            class="year-select w-28 px-4 py-2.5 border-2 border-gray-800 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div class="border-2 border-gray-800 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <div class="max-h-95 overflow-y-auto">
            <table class="w-full border-collapse text-sm table-color text-left table-fixed">
              <thead class="sticky top-0 z-10 table-color border-b-1 border-gray-700">
                <tr>
                  <th class="px-6 py-4 text-white font-bold w-1/2">{{ view === 'monthly' ? 'MONTH' : 'WEEK #' }}</th>
                  <th class="px-6 py-4 text-white font-bold w-1/2">TOTAL EXPENSES</th>
                </tr>
              </thead>
            
              <tbody v-if="view === 'monthly'">
                <tr
                  v-for="(monthData, index) in monthlyTotals"
                  :key="monthData.month"
                  :class="index % 2 === 0 ? 'table-color' : 'table-color2'"
                >
                  <td class="px-6 py-4 whitespace-nowrap">{{ monthData.name }}</td>
                  <td class="px-6 py-4 font-semibold whitespace-nowrap">
                    {{ formatCurrency(monthData.total) }}
                  </td>
                </tr>

                <tr v-if="monthlyTotals.length === 0">
                  <td colspan="2" class="px-6 py-4 text-center text-gray-500">
                    No expenses found for {{ selectedYear }}
                  </td>
                </tr>
              </tbody>

              <tbody v-else>
                <tr
                  v-for="(weekData, index) in weeklyTotals"
                  :key="weekData.week"
                  :class="index % 2 === 0 ? 'table-color' : 'table-color2'"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="cursor-help" 
                      :title="`${weekData.startDate} - ${weekData.endDate}`"
                    >
                      Week {{ weekData.week }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-semibold whitespace-nowrap">
                    {{ formatCurrency(weekData.total) }}
                  </td>
                </tr>
              
                <tr v-if="weeklyTotals.length === 0">
                  <td colspan="2" class="px-6 py-4 text-center text-gray-500">
                    No expenses found for {{ selectedYear }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-center lg:justify-end">
        <p class="text-md font-medium">
          YEARLY TOTAL ({{ selectedYear }}) = {{ formatCurrency(view === 'monthly' ? monthlyYearTotal : yearlyTotal) }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.year-select {
  background-color: #030712;
  color: rgba(255, 255, 255, 0.87);
}

.year-select option {
  background-color: #0f172a;
  color: rgba(255, 255, 255, 0.87);
  padding: 8px;
}

.year-select option:hover {
  background-color: #1e293b;
}
</style>
