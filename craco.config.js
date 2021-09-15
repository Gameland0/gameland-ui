const CracoLessPlugin = require('craco-less')

module.exports = {
  devServer:{
    proxy: {
      '/api': 'http://localhost:8080',
    }
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

