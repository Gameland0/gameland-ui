const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.NODE_ENV === 'development' ? 'http://localhost:8089' : 'https://polygon-api.gameland.network',
      changeOrigin: true,
      pathRewrite: { '^/api': '' }
    })
  )
  app.use(
    '/moralis',
    createProxyMiddleware({
      target: process.env.REACT_APP_MORALIS_API,
      changeOrigin: true,
      pathRewrite: { '^/moralis': '' }
    })
  )
}
