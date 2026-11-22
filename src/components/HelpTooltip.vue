<script setup>
import { useId } from 'vue'
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/outline'

defineProps({
  label: {
    type: String,
    required: true
  }
})

const tooltipId = useId()
</script>

<template>
  <span class="group relative shrink-0">
    <button type="button" :aria-label="label" :aria-describedby="tooltipId"
      class="block rounded-full text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors">
      <QuestionMarkCircleIcon class="w-5 h-5" />
    </button>
    <span :id="tooltipId" role="tooltip"
      class="pointer-events-none absolute right-0 top-full z-10 mt-2 w-64 rounded-lg border-2 border-gray-800 bg-[#0f172a] px-3 py-2 text-xs text-gray-300 shadow-lg opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible">
      <slot />
    </span>
  </span>
</template>
