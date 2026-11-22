<script setup>
import { computed } from 'vue'
import { MagnifyingGlassIcon, EllipsisHorizontalIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'
import { useStorage } from '../composable/useStorage'
import { useMainLogic } from '../composable/useMainLogic'
import TotalsTable from './TotalsTable.vue'
import ExpensesForm from './ExpensesForm.vue'
import RowActionsMenu from './RowActionsMenu.vue'
import DeleteExpenseModal from './DeleteExpenseModal.vue'
import SyncStatus from './SyncStatus.vue'
import SyncSettingsModal from './SyncSettingsModal.vue'

const {
  expenses,
  addExpense,
  updateExpense,
  deleteExpense,
  clientId,
  setClientId,
  syncStatus,
  syncError,
  signIn,
  signOut,
  refresh
} = useStorage()

const {
  searchQuery,
  showTotals,
  showForm,
  editingExpense,
  expenseToDelete,
  isDeleting,
  deleteError,
  openMenu,
  showSyncSettings,
  filteredExpenses,
  totalExpenses,
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
} = useMainLogic(expenses, { addExpense, updateExpense, deleteExpense })

const syncIconClass = computed(() => {
  if (syncStatus.value === 'local') return 'text-gray-400 hover:text-white'
  if (syncStatus.value === 'expired' || syncStatus.value === 'error') return 'text-yellow-400 hover:text-yellow-300'
  return 'text-green-400 hover:text-green-300'
})
</script>

<template>
  <Transition name="modal">
    <ExpensesForm v-if="showForm" :expense="editingExpense" :save="saveExpense" @cancel="handleFormCancel"
      @submit="handleFormSubmit" />
  </Transition>

  <Transition name="modal">
    <DeleteExpenseModal v-if="expenseToDelete" :expense="expenseToDelete" :is-deleting="isDeleting"
      :error="deleteError" @confirm="handleDeleteConfirm" @cancel="handleDeleteCancel" />
  </Transition>

  <Transition name="modal">
    <SyncSettingsModal v-if="showSyncSettings" :client-id="clientId" :status="syncStatus" :error="syncError"
      @save="setClientId" @close="showSyncSettings = false" @sign-in="signIn" @sign-out="signOut" @retry="refresh" />
  </Transition>

  <RowActionsMenu v-if="openMenu" :anchor="openMenu.anchor" @edit="handleEditClick(openMenu.expense)"
    @delete="handleDeleteClick(openMenu.expense)" @close="closeMenu" />

  <div class="max-w-6xl mx-auto p-6">

    <div class="mb-6">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 mb-5">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold">Expense Tracker</h1>
          <button type="button" @click="showSyncSettings = true" aria-label="Google Drive sync settings"
            title="Google Drive sync settings"
            class="p-1.5 rounded-full hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
            :class="syncIconClass">
            <CloudArrowUpIcon class="w-6 h-6" />
          </button>
        </div>
        <SyncStatus v-if="!showSyncSettings" :status="syncStatus" :error="syncError" @sign-in="signIn" @sign-out="signOut" @retry="refresh" />
      </div>
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
            <thead class="sticky top-0 z-10 table-color border-b-1 border-gray-700">
              <tr>
                <th class="px-6 py-4 text-white font-bold w-35">DATE</th>
                <th class="px-6 py-4 text-white font-bold w-50">DESCRIPTION</th>
                <th class="px-6 py-4 text-white font-bold w-35">AMOUNT</th>
                <th class="w-14"><span class="sr-only">Actions</span></th>
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
                <td class="pr-3 py-2 text-right">
                  <button type="button" @click="toggleMenu(expense, $event.currentTarget)"
                    :aria-expanded="openMenu?.expense.id === expense.id" aria-haspopup="menu"
                    aria-label="Expense actions" title="Actions"
                    class="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                    :class="{ 'bg-gray-800 text-white': openMenu?.expense.id === expense.id }">
                    <EllipsisHorizontalIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>

              <tr v-if="filteredExpenses.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                  <template v-if="searchQuery">No expenses found matching "{{ searchQuery }}"</template>
                  <template v-else-if="syncStatus === 'loading'">Loading your expenses…</template>
                  <template v-else-if="syncStatus === 'expired'">Reconnect Google Drive to see your expenses.</template>
                  <template v-else>No expenses yet.</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-6 mb-6 flex flex-col-reverse lg:flex-row gap-4 justify-between items-center font-medium">
      <button @click="showTotals = !showTotals"
        class="px-6 py-2.5 border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors text-sm">
        {{ showTotals ? 'Hide Totals' : 'View Monthly & Weekly Totals' }}
      </button>

      <p class="text-md">
        TOTAL EXPENSES = {{ formatCurrency(totalExpenses) }}
      </p>
    </div>

    <TotalsTable v-if="showTotals" :expenses="expenses" />
    
  </div>
</template>

<style scoped>
</style>