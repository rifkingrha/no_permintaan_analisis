import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function useIdleLogout(timeout = 60 * 60 * 1000) {
  const router = useRouter()

  let idleTimer = null

  const logout = () => {
    console.log('AUTO LOGOUT')

    localStorage.clear()

    router.push('/login')
  }

  const resetTimer = () => {
    clearTimeout(idleTimer)

    idleTimer = setTimeout(() => {
      logout()
    }, timeout)
  }

  const events = [
    'mousemove',
    'mousedown',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ]

  onMounted(() => {
    events.forEach(event => {
      window.addEventListener(event, resetTimer)
    })

    resetTimer()
  })

  onUnmounted(() => {
    clearTimeout(idleTimer)

    events.forEach(event => {
      window.removeEventListener(event, resetTimer)
    })
  })
}