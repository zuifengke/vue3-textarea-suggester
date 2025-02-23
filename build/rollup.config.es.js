import base from './rollup.config.base.js'

const config = Object.assign({}, base, {
  output: {
    name: 'vue3-textarea-suggester',
    file: 'dist/vue3-textarea-suggester.esm.js',
    format: 'es',
  },
})

export default config
