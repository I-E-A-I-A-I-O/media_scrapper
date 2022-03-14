import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { ResponseBody } from '../types/body'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import utils from 'util'

const MEDIA_FOLDER = path.join(__dirname, '..', 'media')

const getContentType = (name: string): string => {
  try {
    const ex = name.split('.')[1]
  
    if (ex === 'mp4') return 'video/mp4'
    else return 'audio/mp3'
  } catch {
    return 'video/mp4'
  }
}

export const convertersRouter: FastifyPluginAsync = async (server, opts) => {
  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/m3u8/mp4', async (request, reply) => {
    let { url } = request.query
  
    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
    if (!url.includes('.m3u8')) return reply.status(400).send('Master m3u8 expected')
    url = url.replace(/\n/g, '')
    server.log.info(`m3u8 URL ${url} received. Converting to mp4.`)
    const fileName = Date()
    const outputPath = `${MEDIA_FOLDER}/${fileName}.mp4`
    server.log.info(`using output path ${outputPath} for m3u8 URL ${url}`)
    const conversion = spawn('ffmpeg', [
      '-i',
      url,
      '-c',
      'copy',
      '-bsf:a',
      'aac_adtstoasc',
      outputPath
    ])
  
    conversion.on('exit', async (code) => {
      server.log.info(`m3u8 URL ${url} conversion finished with code ${code}`)
      
      try {
        const readfile = utils.promisify(fs.readFile)
        const data = await readfile(outputPath)
        reply.type(getContentType(fileName))
        reply.header('Content-Disposition', `attachment; filename=${fileName}`)
        reply.send(data)
        const rm = utils.promisify(fs.rm)
        rm(outputPath)
      } catch(err) {
        server.log.error(err)
        reply.status(500).send('Error sending file. Try again later.')
      }
    })
  })
    
  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/m3u8/mp3', async (request, reply) => {
    let { url } = request.query
  
    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
    if (!url.includes('.m3u8')) return reply.status(400).send('Master m3u8 expected')
    url = url.replace(/\n/g, '')
    server.log.info(`m3u8 URL ${url} received. Converting to mp3.`)
    const fileName = Date()
    const outputPath = `${MEDIA_FOLDER}/${fileName}.mp3`
    server.log.info(`using output path ${outputPath} for m3u8 URL ${url}`)
    const conversion = spawn('ffmpeg', [
      '-i',
      url,
      '-acodec',
      'mp3',
      '-ab',
      '257k',
      outputPath
    ])
  
    conversion.on('exit', async (code) => {
      server.log.info(`m3u8 URL ${url} conversion finished with code ${code}`)
      
      try {

        if (request.socket.destroyed) {
          const rm = utils.promisify(fs.rm)
          await rm(outputPath)
          return
        }

        const readfile = utils.promisify(fs.readFile)
        const data = await readfile(outputPath)
        reply.type(getContentType(fileName))
        reply.header('Content-Disposition', `attachment; filename=${fileName}`)
        reply.send(data)
        const rm = utils.promisify(fs.rm)
        rm(outputPath)
      } catch(err) {
        server.log.error(err)
        reply.status(500).send('Error sending file. Try again later.')
      }
    })
  })
}
