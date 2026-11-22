<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  anchor: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'close'])

const menuEl = ref(null)
const position = ref({ top: '0px', left: '0px', visibility: 'hidden' })

// Teleported to <body> with fixed positioning so the table's overflow containers can't clip it
const placeMenu = () => {
  const gap = 4
  const rect = props.anchor.getBoundingClientRect()
  const { offsetWidth: width, offsetHeight: height } = menuEl.value
  const opensUp = rect.bottom + gap + height > window.innerHeight
  const top = opensUp ? rect.top - gap - height : rect.bottom + gap
  const left = Math.max(8, rect.right - width)
  position.value = { top: `${top}px`, left: `${left}px`, visibility: 'visible' }
}

const handlePointerDown = (event) => {
  if (!menuEl.value.contains(event.target) && !props.anchor.contains(event.target)) {
    emit('close')
  }
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
    props.anchor.focus()
  }
}

const close = () => emit('close')

const choose = (action) => {
  emit(action)
  emit('close')
}

onMounted(() => {
  placeMenu()
  menuEl.value.querySelector('button').focus()
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
})
</script>

<template>
  <Teleport to="body">
    <div ref="menuEl" role="menu" :style="position"
      class="fixed z-40 w-36 py-1 bg-[#0f172a] border-2 border-gray-800 rounded-lg shadow-lg text-sm">
      <button type="button" role="menuitem" @click="choose('edit')"
        class="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none transition-colors">
        <PencilSquareIcon class="w-4 h-4" />
        Edit
      </button>
      <button type="button" role="menuitem" @click="choose('delete')"
        class="flex w-full items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-800 focus:bg-gray-800 focus:outline-none transition-colors">
        <TrashIcon class="w-4 h-4" />
        Delete
      </button>
    </div>
  </Teleport>
</template>
