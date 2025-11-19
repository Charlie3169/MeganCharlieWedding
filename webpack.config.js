const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src', 'scripts', 'main.ts'),
  output: {
    filename: path.join('assets', 'js', 'main.js'),
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src', 'index.html'),
          to: path.resolve(__dirname, 'dist', 'index.html')
        },
        {
          from: path.resolve(__dirname, 'src', 'styles'),
          to: path.resolve(__dirname, 'dist', 'assets', 'css')
        },
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist', 'public'),
          noErrorOnMissing: true
        }
      ]
    })
  ],
  devtool: 'source-map'
};
