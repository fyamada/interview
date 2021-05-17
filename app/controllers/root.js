const logger = require('../logger.js')
const { STORE_API } = require('../store')

/**
 * Draw app service status endpoint
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
function root(req, res) {
  logger.info('Draw microservice status check')
  res.json({ 
    message: 'Draw microservice running',
    drawCheckerCounter: req.app.store.state[STORE_API.STATE.COUNT],
    drawsStats: req.app.store.getters[STORE_API.GETTERS.GET_DRAWS_STATS]
  })
}

module.exports = {
  root
}
