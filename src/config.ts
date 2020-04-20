export const server = {
  port: parseInt(process.env.PORT || '25565')
}

export const logger = {
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'verbose'
}
