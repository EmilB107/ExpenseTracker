<script setup>
import { computed } from 'vue'
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['sign-in', 'sign-out', 'retry'])

const isBusy = computed(() => props.status === 'loading' || props.status === 'saving')
const hasProblem = computed(() => props.status === 'expired' || props.status === 'error')

const buttonClass = 'px-4 py-1.5 border-2 border-gray-800 rounded-full hover:bg-gray-800 transition-colors font-medium'
const linkClass = 'text-gray-400 hover:text-white underline underline-offset-2 transition-colors'
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm" aria-live="polite">
    <template v-if="isBusy">
      <ArrowPathIcon class="w-4 h-4 text-gray-400 animate-spin" />
      <span class="text-gray-400">{{ status === 'saving' ? 'Saving…' : 'Syncing…' }}</span>
    </template>

    <template v-else-if="hasProblem">
      <ExclamationTriangleIcon class="w-4 h-4 text-yellow-400" />
      <span class="text-gray-300">
        {{ status === 'expired' ? 'Google sign-in expired. Your next save reconnects automatically.' : error }}
      </span>
      <button type="button" :class="buttonClass" @click="emit(status === 'expired' ? 'sign-in' : 'retry')">
        {{ status === 'expired' ? 'Reconnect' : 'Retry' }}
      </button>
      <button type="button" :class="linkClass" @click="emit('sign-out')">Sign out</button>
    </template>
  </div>
</template>
