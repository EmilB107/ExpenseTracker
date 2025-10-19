<script setup>
defineProps({
    show: {
        type: Boolean,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>


<template>
    <!-- Confirmation Modal -->
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="emit('cancel')">
        <div class="bg-[#0f172a] border-2 border-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
            <h2 class="text-xl font-bold mb-4">Confirm Expense</h2>
            <p class="mb-6 text-gray-300">
                Are you sure you want to add this expense? You won't be able to edit or delete it later.
            </p>

            <div class="mb-6 space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">Date:</span>
                    <span class="font-medium">{{ date }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Description:</span>
                    <span class="font-medium">{{ description }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Amount:</span>
                    <span class="font-medium">₱{{ amount.toFixed(2) }}</span>
                </div>
            </div>

            <div class="flex gap-4 justify-end">
                <button @click="emit('cancel')"
                    class="px-6 py-2.5 border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium">
                    Cancel
                </button>
                <button @click="emit('confirm')"
                    class="px-6 py-2.5 border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium">
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
