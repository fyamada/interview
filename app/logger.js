// Setup logging
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label } = format
const config = require('config')

const logger = createLogger({
  level: 'debug',
  format: combine(
    timestamp(),
    label({ label: config.get('MicroserviceID') }),
    format.json(),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    level: 'debug',
    format: combine(
        timestamp(),
        format.json(),
      ),
  }))
}

module.exports = logger