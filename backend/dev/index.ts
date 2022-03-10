import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { spawn } from 'child_process'
import { ResponseBody } from './types/body'
import { FromSchema } from 'json-schema-to-ts'

const server: FastifyInstance = Fastify({});

const pyPaths = (venv: boolean): string => {
  const first = __dirname.substring(0, __dirname.lastIndexOf('/'))
  const base = first.substring(0, first.lastIndexOf('/'))

  if (!venv) return `${base}/main.py`

  return `${base}/venv/bin/python3`
}

server.post<{ Body: FromSchema<typeof ResponseBody> }>('/cnn', async (request, reply) => {
  const { url } = request.body

  if (!url) return reply.status(400).send('No URL provided.');

  let m3u8_url: string
  const pScript = spawn(pyPaths(true), [pyPaths(false), url])

  pScript.stdout.on('data', (data) => {
    m3u8_url = data.toString()
  });

  pScript.on('exit', (code) => {
    reply.status(200).send(m3u8_url)
  })

  pScript.on('error', (code) => {
    reply.status(500).send('error')
  })
})

const start = async () => {
  try {
    await server.listen(3000)
    console.log('Server started')
    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port

  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
