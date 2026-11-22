<script setup>
import { formatCurrency } from '../utils/currency'

defineProps({
  expense: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
    @click.self="emit('cancel')">
    <div class="modal-panel w-full max-w-md bg-[#0f172a] border-2 border-gray-800 rounded-lg p-5 lg:p-8"
      role="alertdialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <h2 id="delete-modal-title" class="text-xl font-bold mb-4">Delete Expense</h2>
      <p class="mb-6 text-gray-300">Delete this expense? This can't be undone.</p>

      <div class="mb-6 space-y-2 text-sm">
        <div class="flex justify-between gap-4">
          <span class="text-gray-400">Date:</span>
          <span class="font-medium">{{ expense.date }}</span>
        </div>
        <div class="flex justify-between gap-4">
          <span class="text-gray-400">Description:</span>
          <span class="font-medium text-right break-words min-w-0">{{ expense.description }}</span>
        </div>
        <div class="flex justify-between gap-4">
          <span class="text-gray-400">Amount:</span>
          <span class="font-medium">{{ formatCurrency(expense.amount) }}</span>
        </div>
      </div>

      <div class="flex gap-3 sm:gap-4 justify-end">
        <button type="button" @click="emit('cancel')"
          class="px-5 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium">
          Cancel
        </button>
        <button type="button" @click="emit('confirm')"
          class="px-5 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-red-900 text-red-400 rounded-full hover:bg-red-950 transition-colors font-medium">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>
