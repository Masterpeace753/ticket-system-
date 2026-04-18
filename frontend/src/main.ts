import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import de from './locales/de.json'
import en from './locales/en.json'
import './style.css'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') ?? 'de',
  fallbackLocale: 'de',
  messages: { de, en },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
