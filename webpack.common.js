var path = require('path')
var webpack = require('webpack')

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    app: ['./index.js'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          options: {
            presets: ['env'],
            // plugins: ['transform-object-rest-spread']
          },
          loader: 'babel-loader',
        }
      },
      { test: /\.(glsl|frag|vert)$/, use: { loader: 'raw-loader' }, exclude: /node_modules/ },
      { test: /\.(glsl|frag|vert)$/, use: { loader: 'glslify-loader' }, exclude: /node_modules/ }
    ]
  }
}