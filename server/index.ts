import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import fstatic from 'fastify-static'
import path from 'path'
import { scrapperRouter } from './routes/scrappers.router'
import { convertersRouter } from './routes/converters.router'

const buildDir = path.join(__dirname, '..', 'build')
const server: FastifyInstance = Fastify({ logger: true });
server.register(fstatic, { root: buildDir })

server.register(scrapperRouter, { prefix: '/' })
server.register(convertersRouter, { prefix: '/' })

const start = () => {
  try {
    const PORT = process.env.PORT || 3000
    server.listen(PORT, '0.0.0.0').then(() => {
      server.log.info(`Server running in port ${PORT}`)
    })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
