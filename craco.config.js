const CracoLessPlugin = require('craco-less')

module.exports = {
  // devServer:{
  //   proxy: {
  //     '/api': 'http://localhost:8080',
  //   }
  // },
  webpack: {
    configure: (webpackConfig) => {
      if (process.env.NODE_ENV === 'production') {
        // remove console in production
        const TerserPlugin = webpackConfig.optimization.minimizer.find((i) => i.constructor.name === 'TerserPlugin');
        if (TerserPlugin) {
          TerserPlugin.options.terserOptions.compress['drop_console'] = true;
        }
      }

      return webpackConfig;
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#F6904D' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
}

