import { FastifyPluginAsync } from 'fastify'
import { spawn } from 'child_process'
import { ResponseBody } from '../types/body'
import { FromSchema } from 'json-schema-to-ts'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs-extra'

const BASE_DIR = path.join(__dirname, '..', '..')
const MEDIA_FOLDER = path.join(__dirname, '..', 'media')
//const VENV_SOURCE = path.join(__dirname, '..', '..', 'venv', 'bin', 'python3')
  
const processLink = (url: string): string => {
  if (url.includes('cnn.com')) return 'cnnSearch.py'
  else if (url.includes('rfi.fr')) return 'rfiSearch.py'
  else if (url.includes('youtube.com') || url.includes('youtu.be')) return 'skip'
  else if (url.includes('.m3u8')) return 'skipm3u8'

  return ''
}

const isSS = (name: string): boolean => {
  if (name === 'cnnSearch.py') return true

  return false
}

export const scrapperRouter: FastifyPluginAsync = async (server, opts) => {
  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/scrap/stat', async (request, reply) => {
    const { url } = request.query
  
    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

    const data = await fs.readFile(path.join(MEDIA_FOLDER, url), { encoding: 'utf8' })

    if (data === 'pending') return reply.status(200).send('pending')
    else if (data === 'fail') return reply.status(500).send('fail')

    reply.status(200).send(data)
  })

  server.post<{ Body: FromSchema<typeof ResponseBody> }>('/scrap', async (request, reply) => {
    const { url } = request.body
  
    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
  
    const pythonScript = processLink(url);
  
    if (pythonScript.length === 0) return reply.status(400).send('Website not supported')
    if (pythonScript.includes('skip')) 
      return reply.status(200).send({ url, m3u8: pythonScript.includes('m3u8'), format: 'mp3&mp4' })
    
    const slowScript = isSS(pythonScript)
    const requestId = uuidv4()

    if (slowScript) {
      await fs.ensureFile(path.join(MEDIA_FOLDER, `${requestId}.txt`))
      await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'pending')
      reply.status(202).send(requestId)
    }

    server.log.info(`URL ${url} received. Starting script ${pythonScript}`)
    let media_url: string
    const pScript = spawn(/*VENV_SOURCE*/ 'python3', [path.join(BASE_DIR, pythonScript), url])
  
    pScript.stdout.on('data', (data) => {
      media_url = data.toString()
      server.log.info(`media URL ${media_url} generated for URL ${url}`)
    })
  
    pScript.on('exit', async (code) => {
      if (media_url == null || media_url.length === 0) {
        server.log.warn(`Script failed to extract media URL from ${url} using script ${pythonScript}`)

        if (!slowScript)
          return reply.status(500).send("Couldn't scrap media from URL. Try again later.")
        else
          return await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'fail')
      }
      
      const m3u8 = media_url.includes('.m3u8')
      let format: string
  
      if (m3u8) format = 'mp3&mp4'
      else if (media_url.includes('.mp4')) format = 'mp3&mp4'
      else format = 'mp3'
  
      server.log.info(`Script success. Sending back media URL ${media_url}`)

      if (!slowScript)
        reply.status(200).send({ url: media_url, m3u8, format })
      else
        await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), media_url)
    })
  })
}
