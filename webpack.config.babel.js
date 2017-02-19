import webpack from 'webpack'
import { resolve } from 'path'
import merge from 'webpack-merge'

import modules from './conf/webpack'

const DefinePlugin = new webpack.DefinePlugin({
  PRODUCTION: JSON.stringify(false),
  VERSION:    JSON.stringify('0.1'),
  DEBUG:      JSON.stringify(true)
})

const baseConfig = {
  entry: [
    'babel-regenerator-runtime',
    resolve('src', 'js')
  ],
  output: {
    path:     resolve('dist'),
    filename: '[chunkhash].[name].js'
  },
  // devtool: 'cheap-eval-source-map',
  plugins: [
    DefinePlugin,
    new webpack.optimize.CommonsChunkPlugin({
      name:      'vendor',
      minChunks: ({ userRequest }) => (
        userRequest
        && userRequest.indexOf('node_modules') >= 0
        && userRequest.match(/\.js$/)
      )
    })
    // new webpack.optimize.UglifyJsPlugin({
    //  sourceMap: false,
    //  compress:  { warnings: false }
    // })
  ]
}

export default merge(baseConfig, modules)
