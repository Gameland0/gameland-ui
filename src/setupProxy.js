const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.NODE_ENV === 'production' ? 'https://polygon-api.gameland.network' : 'http://localhost:8089',
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
