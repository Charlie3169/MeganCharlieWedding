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
          from: path.resolve(__dirname, 'public', 'images', 'monogram.svg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'monogram.svg'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'public', 'images', 'actual-images', 'OhioEngagement-193.jpg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'actual-images', 'OhioEngagement-193.jpg'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'public', 'images', 'actual-images', 'OhioEngagement-25.jpg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'actual-images', 'OhioEngagement-25.jpg'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'public', 'images', 'actual-images', 'OhioEngagement-44.jpg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'actual-images', 'OhioEngagement-44.jpg'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'public', 'images', 'actual-images', 'OhioEngagement-103.jpg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'actual-images', 'OhioEngagement-103.jpg'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'public', 'images', 'actual-images', 'OhioEngagement-181.jpg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'actual-images', 'OhioEngagement-181.jpg'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'public', 'images', 'actual-images', 'OhioEngagement-238.jpg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'actual-images', 'OhioEngagement-238.jpg'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'public', 'images', 'actual-images', 'OhioEngagement-210.jpg'),
          to: path.resolve(__dirname, 'dist', 'public', 'images', 'actual-images', 'OhioEngagement-210.jpg'),
          noErrorOnMissing: true
        }
      ]
    })
  ],
  devtool: 'source-map'
};
