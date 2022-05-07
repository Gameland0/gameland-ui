const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/v0',
    createProxyMiddleware({
      target: 'https://polygon-api.gameland.network',
      changeOrigin: true,
      pathRewrite: { '^/v0': process.env.NODE_ENV === 'production' ? '' : '/v0' }
    })
  )
  // test
  app.use(
    '/moralis',
    createProxyMiddleware({
      target: process.env.REACT_APP_MORALIS_API,
      changeOrigin: true,
      pathRewrite: { '^/moralis': '' }
    })
  )
}
