// 修改前
// const path = require('path');
// const { VueLoaderPlugin } = require('vue-loader');
// const webpack = require('webpack');

// 修改后
import path from 'path';
import { fileURLToPath } from 'url';
import { VueLoaderPlugin } from 'vue-loader';
import webpack from 'webpack';

// 获取当前模块的文件路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前模块所在的目录路径
const __dirname = path.dirname(__filename);
// 修改前
// module.exports = {
// 修改后
export default {
  mode: 'development',
  entry: ['@babel/polyfill', './src/main.js'],
  output: {
    path: path.resolve(__dirname, '../docs'),
    publicPath: '/',
    filename: 'build.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader' ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // 将 JS 字符串生成为 style 节点
          'css-loader',   // 将 CSS 转化成 CommonJS 模块
          'sass-loader'   // 将 Sass 编译成 CSS
        ]
      }
      // 其他规则
    ],
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm-bundler.js', // Vue 3 推荐使用
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, '..', 'docs'),
    },
    allowedHosts: 'all',
    port: 7779,
  },
  performance: {
    hints: false,
  },
  devtool: 'eval-source-map',
};

if (process.env.NODE_ENV === 'production') {
  module.exports.mode = 'production';
  module.exports.devtool = '#source-map';
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}
