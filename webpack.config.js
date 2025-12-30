const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: argv.mode || 'development',
    devtool: isProduction ? false : 'inline-source-map',

    entry: {
      background: './src/background/service-worker.js',
      content: './src/content/content-script.js',
      popup: './src/popup/popup.js',
      options: './src/options/options.js',
      sidepanel: './src/sidepanel/sidepanel.js'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          // Manifest
          { from: 'manifest.json', to: 'manifest.json' },

          // HTML files
          { from: 'src/popup/popup.html', to: 'popup.html' },
          { from: 'src/options/options.html', to: 'options.html' },
          { from: 'src/sidepanel/sidepanel.html', to: 'sidepanel.html' },

          // CSS files
          { from: 'src/popup/popup.css', to: 'popup.css' },
          { from: 'src/options/options.css', to: 'options.css' },
          { from: 'src/sidepanel/sidepanel.css', to: 'sidepanel.css' },

          // Icons
          { from: 'src/assets/icons', to: 'icons', noErrorOnMissing: true },

          // PDF.js worker
          {
            from: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
            to: 'pdf.worker.min.mjs'
          }
        ]
      })
    ],

    resolve: {
      extensions: ['.js']
    },

    optimization: {
      minimize: isProduction
    }
  };
};
