import { createApp } from 'vue'
import App from './App.vue'


import router from './router'
import { createPinia } from 'pinia'
import { installStaticTranslator } from './i18n/staticTranslator'


import './assets/tailwind.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'




const app = createApp(App)

app.use(createPinia())
app.use(router)
installStaticTranslator(app)



app.mount('#app')
