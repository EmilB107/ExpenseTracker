<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { useStorage } from '../composable/useStorage'
import { useMainLogic } from '../composable/useMainLogic'
import WeeklyTable from './WeeklyTable.vue'
import ExpensesForm from './ExpensesForm.vue'

const { expenses, addExpense } = useStorage()

const {
  searchQuery,
  showWeeklyTable,
  showForm,
  filteredExpenses,
  totalExpenses,
  formatCurrency,
  handleAddClick,
  handleFormCancel,
  handleFormSubmit
} = useMainLogic(expenses)
</script>

<template>
  <ExpensesForm v-if="showForm" :add-expense="addExpense" @cancel="handleFormCancel" @submit="handleFormSubmit" />

  <div v-else class="max-w-6xl mx-auto p-6">

    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-5">Expense Tracker</h1>
      <div class="flex gap-3 items-center text-sm">
        <div class="flex-1 relative">
          <MagnifyingGlassIcon
            class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input v-model="searchQuery" type="text" placeholder="Search by description"
            class="w-full sm:w-6/10 md:w-5/10 lg:w-4/10 pl-12 pr-4 py-2.5 border-2 border-gray-800 rounded-full focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400" />
        </div>
        <button @click="handleAddClick"
          class="px-8 lg:px-12 py-2.5 border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium">
          ADD
        </button>
      </div>
    </div>

    <div class="border-2 border-gray-800 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <div class="max-h-95 overflow-y-auto">
          <table class="w-full border-collapse text-sm table-color text-left table-fixed">
            <thead class="sticky top-0 z-10 table-color">
              <tr>
                <th class="px-6 py-4 text-white font-bold w-35">DATE</th>
                <th class="px-6 py-4 text-white font-bold w-50">DESCRIPTION</th>
                <th class="px-6 py-4 text-white font-bold w-35">AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(expense, index) in filteredExpenses" :key="expense.id"
                :class="index % 2 === 0 ? 'table-color' : 'table-color2'">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ expense.date }}
                </td>
                <td class="px-6 py-4">
                  <div class="truncate max-w-md" :title="expense.description">
                    {{ expense.description }}
                  </div>
                </td>
                <td class="px-6 py-4 font-semibold whitespace-nowrap">
                  {{ formatCurrency(expense.amount) }}
                </td>
              </tr>

              <tr v-if="filteredExpenses.length === 0">
                <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                  No expenses found matching "{{ searchQuery }}"
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-6 mb-6 flex flex-col-reverse lg:flex-row gap-4 justify-between items-center font-medium">
      <button @click="showWeeklyTable = !showWeeklyTable"
        class="px-6 py-2.5 border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors text-sm">
        {{ showWeeklyTable ? 'Hide Weekly Totals' : 'View Weekly Totals by Year' }}
      </button>

      <p class="text-md">
        TOTAL EXPENSES = {{ formatCurrency(totalExpenses) }}
      </p>
    </div>

    <WeeklyTable v-if="showWeeklyTable" :expenses="expenses" />
    
  </div>
</template>

<style scoped>
</style>