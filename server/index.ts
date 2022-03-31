import dotenv from 'dotenv'
import Fastify, { FastifyInstance } from 'fastify'
import fstatic from 'fastify-static'
import path from 'path'
import { scraperRouter } from './routes/scrapers.router'
import { convertersRouter } from './routes/converters.router'
import { downloadRouter } from './routes/download.router'
import FastifyHelmet from 'fastify-helmet'
import nodecron from 'node-cron'
import fs from 'fs-extra'
import fetch from 'node-fetch'

dotenv.config()
const PORT = process.env.PORT || 4180;
const buildDir = path.join(__dirname, '..', 'build')
const server: FastifyInstance = Fastify({ logger: true });
server.register(FastifyHelmet, { global: true })
server.register(fstatic, { root: buildDir })
server.register(downloadRouter, { prefix: '/download' })
server.register(scraperRouter, { prefix: '/' })
server.register(convertersRouter, { prefix: '/' })

const getProxyList = async () => {
  await fs.ensureFile('proxyList.txt')
  await fs.outputFile('proxyList.txt', '')
  const stream = fs.createWriteStream('proxyList.txt')
  const response = await fetch('https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=elite&simplified=true')
  response.body?.pipe(stream)
}

const job = nodecron.schedule('0 * * * *', async (now) => {
  await getProxyList()
})

server.get('/', async (request, reply) => {
  reply.sendFile('index.html')
})

const start = async () => {
  try {
    server.listen(PORT, '0.0.0.0').then(() => {
      server.log.info(`Server running in port ${PORT}`)
    })
    await getProxyList()
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
