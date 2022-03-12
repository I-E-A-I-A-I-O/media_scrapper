import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { ResponseBody } from '../types/body'
import { spawn } from 'child_process'
import path from 'path'

const MEDIA_FOLDER = path.join(__dirname, '..', 'media')

export const convertersRouter: FastifyPluginAsync = async (server, opts) => {
    server.post<{ Body: FromSchema<typeof ResponseBody> }>('/m3u8/mp4', async (request, reply) => {
        let { url } = request.body
      
        if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
      
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
      
        conversion.on('exit', (code) => {
          server.log.info(`m3u8 URL ${url} conversion finished with code ${code}`)
          reply.status(201).send({fileName})
        })
    })
      
    server.post<{ Body: FromSchema<typeof ResponseBody> }>('/m3u8/mp3', async (request, reply) => {
        let { url } = request.body
      
        if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
      
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
      
        conversion.on('exit', (code) => {
          server.log.info(`m3u8 URL ${url} conversion finished with code ${code}`)
          reply.status(201).send({fileName})
        })
    })
}
