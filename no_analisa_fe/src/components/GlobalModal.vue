<script setup>
import { useMessage } from '@/services/useMessage';
const { showMessageModal, messageToShow, close } = useMessage();
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': showMessageModal }">
    <div class="modal-box p-0 overflow-hidden bg-base-100 border border-base-100 shadow-2xl">
      <div class="flex items-center justify-between p-4 border-b bg-base-200">
        <h3 class="font-bold text-lg" :class="messageToShow.type === 'error' ? 'text-error' : 'text-primary'">
          {{ messageToShow.title }}
        </h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="close">✕</button>
      </div>

      <div class="p-6">
        <p class="text-base leading-relaxed">{{ messageToShow.message }}</p>
      </div>

      <div class="modal-action p-4 bg-base-200 mt-0">
        <button class="btn btn-sm px-6" @click="close">OK</button>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop bg-black/40" @click="close">
      <button >close</button>
    </form>
  </dialog>
</template>