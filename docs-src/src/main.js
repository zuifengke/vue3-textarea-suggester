import {createApp} from 'vue'
import App from './App.vue'
import VueTextSuggester from '../../src/index.js'

import '../../dist/vue-textarea-suggester.css'
const app = createApp(App);
app.use(VueTextSuggester)
// 禁用性能追踪提示
app.config.performance = false;

// 挂载应用
app.mount('#app');
