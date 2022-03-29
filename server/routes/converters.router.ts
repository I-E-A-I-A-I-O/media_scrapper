import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { ResponseBody } from '../types/body'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { v4 as uuidv4 } from 'uuid'

const MEDIA_FOLDER = path.join(__dirname, '..', 'media')
const BASE_DIR = path.join(__dirname, '..', '..')
const VENV_SOURCE = path.join(__dirname, '..', '..', 'venv', 'bin', 'python3')

/*const getContentType = (name: string): string => {
  try {
    const ex = name.split('.')[1]
  
    if (ex === 'mp4') return 'video/mp4'
    else return 'audio/mp3'
  } catch {
    return 'video/mp4'
  }
}*/

export const convertersRouter: FastifyPluginAsync = async (server, opts) => {
  /*server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/mp4/mp3', async (request, reply) => {
    let { url } = request.query

    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

    const requestId = uuidv4()
    await fs.ensureFile(path.join(MEDIA_FOLDER, `${requestId}.txt`))
    await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'pending')
    reply.status(202).send(`${requestId}.txt`)
    url = url.replace(/\n/g, '')
    server.log.info(`mp4 URL ${url} received. Converting to mp3.`)
    const fileName = Date()
    const outputPath = `${MEDIA_FOLDER}/${fileName}.mp3`
    server.log.info(`using output path ${outputPath} for mp4 URL ${url}`)

  })*/

  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/twitter/mp3', async (request, reply) => {
    let { url } = request.query

    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

    const requestId = uuidv4()
    await fs.ensureFile(path.join(MEDIA_FOLDER, `${requestId}.txt`))
    await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'pending')
    reply.status(202).send(`${requestId}.txt`)
    url = url.replace(/\n/g, '')
  })

  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/m3u8/mp4', async (request, reply) => {
    let { url } = request.query
  
    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
    if (!url.includes('.m3u8')) return reply.status(400).send('Master m3u8 expected')
    
    const requestId = uuidv4()
    await fs.ensureFile(path.join(MEDIA_FOLDER, `${requestId}.txt`))
    await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'pending')
    reply.status(202).send(`${requestId}.txt`)
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
        await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), `${fileName}.mp4`)
      } catch(err) {
        server.log.error(err)
        fs.rm(outputPath)
        await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'fail')
      }
    })
  })
  
  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/conversion/stat', async (request, reply) => {
    let { url } = request.query

    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

    const data = await fs.readFile(path.join(MEDIA_FOLDER, url), { encoding: 'utf8' })

    if (data === 'pending') return reply.status(200).send('pending')
    else if (data === 'fail') return reply.status(500).send('fail')

    reply.status(200).send(data)
  })

  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/m3u8/mp3', async (request, reply) => {
    let { url } = request.query
  
    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')
    if (!url.includes('.m3u8')) return reply.status(400).send('Master m3u8 expected')

    const requestId = uuidv4()
    await fs.ensureFile(path.join(MEDIA_FOLDER, `${requestId}.txt`))
    await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'pending')
    reply.status(202).send(`${requestId}.txt`)
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
        await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), `${fileName}.mp3`)
      } catch(err) {
        server.log.error(err)
        fs.rm(outputPath)
        await fs.outputFile(path.join(MEDIA_FOLDER, `${requestId}.txt`), 'fail')
      }
    })
  })

  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/youtube/mp3', async (request, reply) => {
    let { url } = request.query

    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

    url = url.replace(/\n/g, '')
    const pScript = spawn(VENV_SOURCE /*'python3'*/, [path.join(BASE_DIR, 'ytDownload.py'), url, 'audio'])
    let filename = ''

    pScript.stdout.on('data', (data) => {
      filename = data.toString()
      filename = filename.replace(/\n/g, '')
      server.log.info(`Youtube video download from URL ${url} with MP3 format`)
    })

    pScript.on('exit', async (code) => {
      if (filename == null || filename.length === 0) {
        server.log.warn(`Youtube download failed from ${url} using script ytDownload.py`)
        return reply.status(500).send("Couldn't scrap media from URL. Try again later.")
      }

      try {
        const filepath = path.join(MEDIA_FOLDER, filename)
        const filedata = await fs.readFile(filepath)
        reply.type('audio/mp3')
        reply.header('Content-Disposition', `attachment; filename=${filename}`)
        await reply.send(filedata)
        fs.rm(filepath)
      } catch (err) {
        server.log.error(err)
        reply.status(500).send('Error sending file. Try again later.')
      }
    })
  })

  server.get<{ Querystring: FromSchema<typeof ResponseBody> }>('/youtube/mp4', async (request, reply) => {
    let { url } = request.query

    if (!url || url.length === 0) return reply.status(400).send('No URL provided.')

    url = url.replace(/\n/g, '')
    const pScript = spawn(VENV_SOURCE /*'python3'*/, [path.join(BASE_DIR, 'ytDownload.py'), url, 'video'])
    let filename = ''

    pScript.stdout.on('data', (data) => {
      filename = data.toString()
      filename = filename.replace(/\n/g, '')
      server.log.info(`Youtube video download from URL ${url} with MP4 format`)
    })

    pScript.on('exit', async (code) => {
      if (filename == null || filename.length === 0) {
        server.log.warn(`Youtube download failed from ${url} using script ytDownload.py`)
        return reply.status(500).send("Couldn't scrap media from URL. Try again later.")
      }

      try {
        const filepath = path.join(MEDIA_FOLDER, filename)
        const filedata = await fs.readFile(filepath)
        reply.type('video/mp4')
        reply.header('Content-Disposition', `attachment; filename=${filename}`)
        reply.send(filedata)
        fs.rm(filepath)
      } catch (err) {
        server.log.error(err)
        reply.status(500).send('Error sending file. Try again later.')
      }
    })
  })
}
