import { createLogger, format, transports } from 'winston'
import path from 'path'
import { logger } from '../config'

const { File, Console } = transports
const LOGS = path.resolve(__dirname, '../../logs')

const { combine, printf, timestamp, colorize } = format

export default createLogger({
  transports: [
    new File({
      filename: path.resolve(LOGS, 'info.log'),
      level: 'info'
    }),
    new File({
      filename: path.resolve(LOGS, 'error.log'),
      level: 'error'
    }),
    new File({
      filename: path.resolve(LOGS, 'verbose.log'),
      level: 'verbose'
    }),
    new Console({
      level: logger.logLevel,
      format: combine(
        colorize(),
        timestamp(),
        printf(({ level, message, timestamp }) => {
          return `${timestamp} [${process.pid}] [${level}] ${message}`
        })
      )
    })
  ]
})
