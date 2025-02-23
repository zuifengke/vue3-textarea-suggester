import base from './rollup.config.base.js'
// import { uglify } from 'rollup-plugin-uglify'
// import { minify } from 'uglify-es'

const config = Object.assign({}, base, {
  output: {
    exports: 'named',
    name: 'VueTextareaSuggester',
    file: 'dist/vue3-textarea-suggester.min.js',
    format: 'iife'
  },
})

// config.plugins.push(uglify({}, minify))

export default config
