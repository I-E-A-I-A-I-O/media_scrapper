import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import fstatic from 'fastify-static'
import path from 'path'
import { scrapperRouter } from './routes/scrappers.router'
import { convertersRouter } from './routes/converters.router'
import { downloadRouter } from './routes/download.router'
import FastifyHelmet from 'fastify-helmet'

const PORT = process.env.PORT || 4180;
const buildDir = path.join(__dirname, '..', 'build')
const server: FastifyInstance = Fastify({ logger: true });
server.register(FastifyHelmet, { global: true })
server.register(fstatic, { root: buildDir })
server.register(downloadRouter, { prefix: '/download' })
server.register(scrapperRouter, { prefix: '/' })
server.register(convertersRouter, { prefix: '/' })

server.get('/', async (request, reply) => {
  reply.sendFile('index.html')
})

const start = () => {
  try {
    server.listen(PORT, '0.0.0.0').then(() => {
      server.log.info(`Server running in port ${PORT}`)
    })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
