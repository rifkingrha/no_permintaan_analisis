<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  message: String,
  type: {
    type: String,
    default: 'success', // success | error | warning | info
  },
  duration: {
    type: Number,
    default: 3000,
  },
})

const emit = defineEmits(['close'])

const toastClass = computed(() => {
  switch (props.type) {
    case 'error':
      return 'alert-error'
    case 'warning':
      return 'alert-warning'
    case 'info':
      return 'alert-info'
    default:
      return 'alert-success'
  }
})

// auto close
watch(
  () => props.show,
  (val) => {
    if (val) {
      setTimeout(() => emit('close'), props.duration)
    }
  }
)
</script>

<template>
  <div v-if="show" class="toast toast-top toast-end z-50">
    <div class="alert shadow-lg" :class="toastClass">
      <span>{{ message }}</span>
    </div>
  </div>
</template>