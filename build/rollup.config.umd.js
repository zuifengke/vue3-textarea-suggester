import base from './rollup.config.base.js'

const config = Object.assign({}, base, {
  output: {
    exports: 'named',
    name: 'vue3-textarea-suggester',
    file: 'dist/vue3-textarea-suggester.umd.js',
    format: 'umd',
  },
})

export default config
