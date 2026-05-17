import type { ToastServiceMethods } from 'primevue/toastservice'

let toast: ToastServiceMethods | null = null

export function setToast(instance: ToastServiceMethods) {
  toast = instance
}

export function getToast() {
  return toast
}
