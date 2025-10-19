<script setup>
import { toRef } from 'vue'
import { useWeeklyLogic } from '../composable/useWeeklyLogic'

// Receive expenses as a prop from parent
const props = defineProps({
  expenses: {
    type: Object, // This receives the unwrapped array from parent
    required: true
  }
})

// Convert the unwrapped prop back to a ref for useWeeklyLogic
const expensesRef = toRef(props, 'expenses')

// Weekly logic layer
const {
  selectedYear,
  availableYears,
  weeklyTotals,
  yearlyTotal,
  formatCurrency
} = useWeeklyLogic(expensesRef)
</script>

<template>
  <div class="max-w-6xl lg:max-w-1/2 xl:max-w-1/3 mx-auto p-6 pt-0">
    <div class="mb-6">
      <div class="flex gap-3 items-center text-sm">
        <select
          v-model="selectedYear"
          class="w-1/3 sm:w-1/5 md:w-1/6 lg:w-1/4 px-4 py-2.5 border-2 border-gray-800 rounded-full focus:outline-none focus:border-blue-500 transition-colors"
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
            <thead class="sticky top-0 z-10 table-color">
              <tr>
                <th class="px-6 py-4 text-white font-bold w-1/2">WEEK #</th>
                <th class="px-6 py-4 text-white font-bold w-1/2">TOTAL EXPENSES</th>
              </tr>
            </thead>
            
            <tbody>
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
              
              <!-- Empty state -->
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
        YEARLY TOTAL ({{ selectedYear }}) = {{ formatCurrency(yearlyTotal) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for table */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
