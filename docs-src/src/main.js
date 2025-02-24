import {createApp} from 'vue'
import App from './App.vue'
import plugin from '../../src/index.js'
//import plugin from '../../dist/vue3-textarea-suggester.esm.js'

import '../../dist/vue3-textarea-suggester.css'
const app = createApp(App);
app.use(plugin)
// 禁用性能追踪提示
app.config.performance = false;

// 挂载应用
app.mount('#app');
