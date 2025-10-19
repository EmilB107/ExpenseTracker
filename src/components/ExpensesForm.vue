<script setup>
import { onMounted } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useFormLogic } from '../composable/useFormLogic'
import ConfirmationModal from './ConfirmationModal.vue'

const props = defineProps({
  addExpense: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['cancel', 'submit'])

// Form logic layer - pass dependencies
const {
  formData,
  errors,
  showConfirmation,
  selectedDate,
  isFormValid,
  updateFormDate,
  formatDateForDisplay,
  handleSubmit,
  handleConfirmSubmit,
  handleCancelConfirmation,
  handleCancel,
  getMaxDate,
  initializeDate
} = useFormLogic(props.addExpense, emit)

// Initialize date on mount
onMounted(() => {
  initializeDate()
})
</script>

<template>
  <div class="max-w-3xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-5">Add New Expense</h1>
    <div class="border-2 border-gray-800 rounded-lg p-5 lg:p-10">
      <form @submit.prevent="handleSubmit" class="space-y-6">

        <div class="space-y-2">
          <label for="date" class="block text-sm font-medium">
            Date <span class="text-red-500">*</span>
          </label>
          <VueDatePicker v-model="selectedDate" @update:model-value="updateFormDate" :max-date="getMaxDate()"
            :enable-time-picker="false" auto-apply :dark="true" placeholder="Select date" format="MM/dd/yyyy"
            :class="{ 'error-border': errors.date }" />
          <p v-if="errors.date" class="text-sm text-red-500">{{ errors.date }}</p>
        </div>

        <div class="space-y-2">
          <label for="description" class="block text-sm font-medium">
            Description <span class="text-red-500">*</span>
          </label>
          <input id="description" v-model="formData.description" type="text" placeholder="Enter expense description"
            class="w-full text-xs lg:text-sm px-4 py-2.5 border-2 border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
            :class="{ 'border-red-500': errors.description }" />
          <p v-if="errors.description" class="text-sm text-red-500">{{ errors.description }}</p>
        </div>

        <div class="space-y-2">
          <label for="amount" class="block text-sm font-medium">
            Amount (₱) <span class="text-red-500">*</span>
          </label>
          <input id="amount" v-model="formData.amount" type="number" step="0.01" placeholder="0.00"
            class="w-full text-xs lg:text-sm px-4 py-2.5 border-2 border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
            :class="{ 'border-red-500': errors.amount }" />
          <p v-if="errors.amount" class="text-sm text-red-500">{{ errors.amount }}</p>
        </div>

        <div class="flex gap-3 sm:gap-4 justify-end pt-3">
          <button type="button" @click="handleCancel"
            class="px-5 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
          <button type="submit"
            class="px-5 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isFormValid">
            Submit
          </button>
        </div>
      </form>
    </div>

    <ConfirmationModal :show="showConfirmation" :date="formatDateForDisplay(selectedDate)"
      :description="formData.description" :amount="parseFloat(formData.amount || 0)" @confirm="handleConfirmSubmit"
      @cancel="handleCancelConfirmation" />
  </div>
</template>

<style scoped>
/* Remove spinner from number input */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Fix autofill styling */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-background-clip: text;
  -webkit-text-fill-color: rgba(255, 255, 255, 0.87);
  transition: background-color 5000s ease-in-out 0s;
  box-shadow: inset 0 0 20px 20px #030712;
}

/* Custom date picker styling */
:deep(.dp__input) {
  border: 2px solid rgb(31 41 55);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background-color: transparent;
  font-size: 1rem;
  color: #fff;
  height: 48px;
}

:deep(.dp__input::placeholder) {
  color: rgb(156 163 175);
}

:deep(.dp__input_icon) {
  color: rgb(156 163 175);
  width: 20px;
  height: 20px;
}

:deep(.dp__input:focus) {
  border-color: rgb(59 130 246);
  outline: none;
}

:deep(.dp__input:hover) {
  border-color: rgb(59 130 246);
}

.error-border :deep(.dp__input) {
  border-color: rgb(239 68 68);
}

/* Date picker dark theme customization */
:deep(.dp__theme_dark) {
  --dp-background-color: #101828;
  --dp-text-color: #fff;
  --dp-hover-color: #1e293b;
  --dp-hover-text-color: #fff;
  --dp-hover-icon-color: #fff;
  --dp-primary-color: rgb(59 130 246);
  --dp-primary-text-color: #fff;
  --dp-secondary-color: #1e293b;
  --dp-border-color: rgb(31 41 55);
  --dp-menu-border-color: rgb(31 41 55);
  --dp-border-color-hover: rgb(59 130 246);
  --dp-disabled-color: #4b5563;
  --dp-scroll-bar-background: #1e293b;
  --dp-scroll-bar-color: #4b5563;
  --dp-success-color: rgb(34 197 94);
  --dp-success-color-disabled: rgb(34 197 94 / 0.5);
  --dp-icon-color: #9ca3af;
  --dp-danger-color: rgb(239 68 68);
}
</style>
