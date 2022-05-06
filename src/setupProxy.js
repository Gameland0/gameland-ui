const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://testnet-api.gameland.network',
      changeOrigin: true,
      pathRewrite: { '^/api': '' }
    })
  )
}
