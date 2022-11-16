'use strict'
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const WebpackVersionFilePlugin = require('webpack-version-file-plugin')

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim()


let tag = "master"

try {
  tag = require('child_process')
  .execSync('git describe --tags')
  .toString()
  .trim()
} catch (err){
  // swallow the exception
}


module.exports = {
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['*.js'],
    }),
    new WebpackVersionFilePlugin({
      packageFile: path.join(__dirname, 'package.json'),
      template: path.join(__dirname, 'version.ejs'),
      outputFile: path.join(__dirname, 'dist', 'version.json'),
      meta: {
        githash: commitHash,
        gittag: tag,
        buildDate: Date.now(),
      },
    }),
  ],
  entry: {
    Greeting: './src/Greeting',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    libraryTarget: 'amd',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'vendor',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.webpack.json' })],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.webpack.json',
        },
      },
      {
        enforce: 'pre',
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.(png|jpe?g|gif|jp2|webp)$/,
        loader: 'url-loader',
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  mode: 'production',
}
