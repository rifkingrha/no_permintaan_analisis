import { reactive, ref } from 'vue';

const showMessageModal = ref(false);
const messageToShow = reactive({
  title: '',
  message: '',
  type: 'error' // You can add 'success', 'warning', etc.
});

export function useMessage() {
  const show = (title, message, type = 'error') => {
    messageToShow.title = title;
    messageToShow.message = message;
    messageToShow.type = type;
    showMessageModal.value = true;
  };

  const close = () => {
    showMessageModal.value = false;
  };

  return { showMessageModal, messageToShow, show, close };
}