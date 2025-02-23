import VueComponent from './components/suggester/index.js';

import './scss/index.scss'
import {createApp} from "vue";

const components = [
  VueComponent
];

const plugin = {
  install(Vue, opts = {}) {
    components.forEach(component => {
      Vue.component(component.name, component);
    });
  },
}
// Auto-install
// let GlobalVue = null
// if (typeof window !== 'undefined') {
//   GlobalVue = window.Vue
// } else if (typeof global !== 'undefined') {
//   GlobalVue = global.Vue
// }
// if (GlobalVue) {
//   GlobalVue.use(plugin)
// }

// Auto-install

let app = null;
if (typeof window !== 'undefined') {
  // 在浏览器环境下
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    // 如果有 Vue DevTools 全局钩子，可能是在浏览器环境中调试
    app = createApp({});
  }
} else if (typeof global !== 'undefined') {
  // 在 Node.js 环境下
  // 在 Node.js 环境通常不会自动安装插件，这里只是示例逻辑
  app = createApp({});
}

if (app) {
  app.use(plugin);
  // 如果需要挂载应用，可以在这里添加挂载逻辑
  // app.mount('#app');
}



export default plugin
