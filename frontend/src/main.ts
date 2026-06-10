import { createApp } from 'vue'

import App from './app/App.vue'
import { installProviders } from './app/providers'

import './app/styles/index.css'
import 'primeicons/primeicons.css'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

const app = createApp(App)
installProviders(app)
app.mount('#app')
