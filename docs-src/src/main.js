import {createApp} from 'vue'
import App from './App.vue'
import Vue3TextSuggester from '../../src/index.js'

import '../../dist/vue3-textarea-suggester.css'
const app = createApp(App);
app.use(Vue3TextSuggester)
// 禁用性能追踪提示
app.config.performance = false;

// 挂载应用
app.mount('#app');
