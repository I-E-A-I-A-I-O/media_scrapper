import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { spawn } from 'child_process'
import { ResponseBody } from './types/body'
import { FromSchema } from 'json-schema-to-ts'
import fstatic from 'fastify-static'
import path from 'path'

const buildDir = path.join(__dirname, '..', 'build')

const server: FastifyInstance = Fastify({});

server.register(fstatic, { root: buildDir })

const pyPaths = (venv: boolean): string => {
  const first = __dirname.substring(0, __dirname.lastIndexOf('/'))
  const base = first.substring(0, first.lastIndexOf('/'))

  if (!venv) return `${base}/main.py`

  return `${base}/venv/bin/python3`
}

server.post<{ Body: FromSchema<typeof ResponseBody> }>('/cnn', async (request, reply) => {
  const { url } = request.body

  if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

  server.log.info(`CNN URL ${url} received`)
  let m3u8_url: string
  const pScript = spawn(pyPaths(true), [pyPaths(false), url])

  pScript.stdout.on('data', (data) => {
    m3u8_url = data.toString()
    server.log.info(`m3u8 URL ${m3u8_url} generated for CNN URL ${url}`)
  })

  pScript.on('error', (err) => {
    server.log.warn(`Python CNN script crashed with error ${err}`)
    reply.status(500).send('error')
  })

  pScript.on('exit', (code) => {
    server.log.error(`Script success. Generating MP4 for ${url}`)
    reply.status(200).send(m3u8_url)
  })
})

const start = async () => {
  try {
    const PORT = process.env.PORT || 3000
    await server.listen(PORT)
    server.log.info(`Server running in port ${PORT}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
