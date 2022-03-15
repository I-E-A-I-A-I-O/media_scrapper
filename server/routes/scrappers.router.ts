import { FastifyPluginAsync } from 'fastify'
import { spawn } from 'child_process'
import { ResponseBody } from '../types/body'
import { FromSchema } from 'json-schema-to-ts'
import path from 'path'

const BASE_DIR = path.join(__dirname, '..', '..')
//const VENV_SOURCE = path.join(__dirname, '..', '..', 'venv', 'bin', 'python3')
  
const processLink = (url: string): string => {
    if (url.includes('cnn.com')) return 'cnnSearch.py'
    else if (url.includes('rfi.fr')) return 'rfiSearch.py'
    else if (url.includes('youtube.com') || url.includes('youtu.be')) return 'skip'
    else if (url.includes('.m3u8')) return 'skipm3u8'
  
    return ''
}

export const scrapperRouter: FastifyPluginAsync = async (server, opts) => {
    server.post<{ Body: FromSchema<typeof ResponseBody> }>('/scrap', async (request, reply) => {
        const { url } = request.body
      
        if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
      
        const pythonScript = processLink(url);
      
        if (pythonScript.length === 0) return reply.status(400).send('Website not supported')

        if (pythonScript.includes('skip')) 
          return reply.status(200).send({ media_url: url, m3u8: pythonScript.includes('m3u8'), format: 'mp3&mp4' })
      
        server.log.info(`URL ${url} received. Starting script ${pythonScript}`)
        let media_url: string
        const pScript = spawn(/*VENV_SOURCE*/ 'python3', [path.join(BASE_DIR, pythonScript), url])
      
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
}
