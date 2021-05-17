const { STORE_API } = require('../store')
const logger = require('../logger.js')
const { PowerballTicket } = require('../types')

/**
 * Evaluates prizes for a griven set of powerball numbers. Returns draw results for a given date
 * @param {*} req Expects a PowerballTicket json in body
 * @param {*} res Express response channel
 * @returns Return PowerballPrize json response with whether each pick has won, 
 * the prize won per-pick, and the total of all prizes won on the ticket
 */
function drawChecker(req, res) {
  if(!req.app.store.state[STORE_API.STATE.DRAWS_LOADED]) {
      res.status(503).json({ message: `drawchecker error. Message: Draws have not been loaded yet.`})
      return
  }
  const ticket = Object.assign(new PowerballTicket(), req.body)
  if (ticket.draw_date) {
    try {
      req.app.store.commit(STORE_API.MUTATIONS.INCREMET)
      const draw = req.app.store.getters[STORE_API.GETTERS.GET_DRAW_BY_DATE](ticket.getDrawTimestamp())
      if(typeof(draw) == "undefined") {
        res.status(400).json({ message: `drawchecker error. Message: Could not find draw for the given date`})
        return
      }
      let prize = draw.computePrize(ticket)
      logger.info(`Prize computed. ${JSON.stringify(prize)}`)
      res.json(prize)
    } catch(error) {
      logger.warn(`drawChecker error. Processing body ${JSON.stringify(req.body)} Error message: ${error.message} Stack: ${error.stack}`)
      res.status(400).json({ message: `drawchecker error. Message: ${error.message}`})
    }
  } else {
    logger.warn('Missing draw_date query parameter')
    res.status(400).json({ message: 'Missing draw_date query parameter'})
  }
}

module.exports = {
  drawChecker
}
