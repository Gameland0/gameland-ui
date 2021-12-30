const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // target: 'http://testnet-api.gameland.network',
      target: 'http://localhost:8088',
      changeOrigin: true,
      pathRewrite: {'^/api': ''}
    })
  )
}
