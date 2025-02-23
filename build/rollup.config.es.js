import base from './rollup.config.base.js'

const config = Object.assign({}, base, {
  output: {
    name: 'vue-textarea-suggester',
    file: 'dist/vue-textarea-suggester.esm.js',
    format: 'es',
  },
})

export default config
