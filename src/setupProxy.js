const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.NODE_ENV === 'development' ? 'http://localhost:8088' : 'https://testnet-api.gameland.network',
      changeOrigin: true,
      pathRewrite: { '^/api': '' }
    })
  )
}
