import './assets/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Import Vuetify styles and Material Design Icons
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css' 


// @ts-ignore
import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi', // Use MDI as the default icon set
  },
})

const app = createApp(App)
const pinia = createPinia()

app.use(router).use(pinia).use(vuetify)

app.mount('#app')
