import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import axios from 'axios'
import ToastService from 'primevue/toastservice'
import Ripple from 'primevue/ripple'
import 'primeicons/primeicons.css'
import { setToast } from '@/services/toast'
import KeyFilter from 'primevue/keyfilter'

import './style.css'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
})
app.use(ToastService)
setToast(app.config.globalProperties.$toast)
app.directive('ripple', Ripple)
app.directive('keyfilter', KeyFilter)
app.mount('#app')
