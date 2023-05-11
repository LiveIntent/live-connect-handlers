// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonConfig = require('live-connect-common/webpack.config.common')

module.exports = {
  ...commonConfig('lcHandlers', { passes: 2 }),
  externals: [
    /live-connect-common/,
    'js-cookie'
  ]
}
