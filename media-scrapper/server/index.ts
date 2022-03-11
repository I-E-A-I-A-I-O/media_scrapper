import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { spawn } from 'child_process'
import { ResponseBody } from './types/body'
import { FromSchema } from 'json-schema-to-ts'
import fstatic from 'fastify-static'
import path from 'path'

const buildDir = path.join(__dirname, '..', 'build')

const server: FastifyInstance = Fastify({ logger: true });

server.register(fstatic, { root: buildDir })

const pyPaths = (venv: boolean, script: string): string => {
  const first = __dirname.substring(0, __dirname.lastIndexOf('/'))
  const base = first.substring(0, first.lastIndexOf('/'))

  if (!venv) return `${base}/${script}`

  return `${base}/venv/bin/python3`
}

const processLink = (url: string): string => {
  if (url.includes('cnn.com')) return 'cnnSearch.py'

  return ''
}

server.post<{ Body: FromSchema<typeof ResponseBody> }>('/scrap', async (request, reply) => {
  const { url } = request.body

  if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

  const pythonScript = processLink(url);

  if (pythonScript.length === 0) return reply.status(400).send('Website not supported')

  server.log.info(`URL ${url} received. Starting script ${pythonScript}`)
  let media_url: string
  const pScript = spawn(pyPaths(true, ''), [pyPaths(false, pythonScript), url])

  pScript.stdout.on('data', (data) => {
    media_url = data.toString()
    server.log.info(`media URL ${media_url} generated for URL ${url}`)
  })

  pScript.on('exit', (code) => {
    if (media_url == null || media_url.length === 0) {
      server.log.warn(`Script failed to extract media URL from ${url} using script ${pythonScript}`)
      return reply.status(500).send("Couldn't scrap media from URL. Try again later.")
    }
    
    const m3u8 = media_url.includes('.m3u8')
    let format: string

    if (m3u8) format = 'mp3&mp4'
    else if (media_url.includes('.mp4')) format = 'mp3&mp4'
    else format = 'mp3'

    server.log.info(`Script success. Sending back media URL ${media_url}`)
    reply.status(200).send({ url: media_url, m3u8, format })
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
