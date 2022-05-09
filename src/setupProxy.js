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
      target: 'https://deep-index.moralis.io/api/v2',
      changeOrigin: true,
      pathRewrite: { '^/moralis': '' }
    })
  )
}
