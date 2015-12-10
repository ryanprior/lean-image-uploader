var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'src/plugin.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'lean-image-uploader.js',
    library: 'leanImageUploader',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ]
  },

  externals: {
    jquery: {
      root: 'jQuery',
      commonjs: 'jquery',
      commonjs2: 'jquery',
      amd: 'jquery',
    }
  },

  resolve: {
    extensions: [ '', '.js' ],
    fallback: path.join(__dirname, 'node_modules')
  },

  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  }
};
