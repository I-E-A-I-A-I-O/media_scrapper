import { FastifyPluginAsync } from 'fastify'
import path from 'path'
import fs from 'fs'
import utils from 'util'
import { FromSchema } from 'json-schema-to-ts'
import { FileParams } from '../types/body'

const MEDIA_FOLDER = path.join(__dirname, '..', 'media')

const getContentType = (name: string): string => {
    const ex = name.split('.')[1]
    
    if (ex === 'mp4') return 'video/mp4'
    else return 'audio/mp3'
}

export const downloadRouter: FastifyPluginAsync = async (server, opts) => {

    server.get<{ Params: FromSchema<typeof FileParams> }>('/:fileName', async (request, reply) => {
        let { fileName } = request.params
        
        //fileName = fileName.concat('.mp4')
        server.log.info(`Download request received for file name ${fileName}`)
        const readdir = utils.promisify(fs.readdir)
        
        try {
          const files = await readdir(MEDIA_FOLDER)
      
          if (!files.find((f) => f === fileName)) return reply.status(404).send('File not found')
      
          const filePath = path.join(MEDIA_FOLDER, fileName)
          const readfile = utils.promisify(fs.readFile)
          const data = await readfile(filePath)
          reply.type(getContentType(fileName))
          reply.header('Content-Disposition', `attachment; filename=${fileName}`)
          reply.send(data)
          const rm = utils.promisify(fs.rm)
          rm(filePath)
        } catch(err) {
          server.log.error(err)
          reply.status(500).send('Error sending file. Try again later.')
        }
    })
}
