module.exports = function override(config, env) {
  // Disable source maps in production
  if (env === 'production') {
    config.devtool = false;
  }

  // Use a simpler terser plugin configuration
  const TerserPlugin = require('terser-webpack-plugin');
  config.optimization.minimizer = [
    new TerserPlugin({
      terserOptions: {
        parse: {
          ecma: 8,
        },
        compress: {
          ecma: 5,
          warnings: false,
          comparisons: false,
          inline: 2,
        },
        mangle: {
          safari10: true,
        },
        output: {
          ecma: 5,
          comments: false,
          ascii_only: true,
        },
      },
      parallel: true,
    }),
  ];

  return config;
};
