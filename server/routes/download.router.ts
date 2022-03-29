import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { FileParams } from '../types/body'
import fs from 'fs-extra'
import path from 'path'

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

export const downloadRouter: FastifyPluginAsync = async (server, opts) => {
    server.get<{ Params: FromSchema<typeof FileParams> }>('/:fileName', async (request, reply) => {
        const { fileName } = request.params
        const filePath = path.join(MEDIA_FOLDER, fileName)
        
        try {
            const data = await fs.readFile(filePath)
            reply.type(getContentType(fileName))
            reply.header('Content-Disposition', `attachment; filename=${fileName}`)
            reply.send(data)

            request.socket.on('close', async (err) => {
                if (err) return

                try {
                    await fs.rm(filePath)
                } catch (err) {
                    server.log.error(err)
                }
            })
        } catch (err) {
            try {
                await fs.rm(filePath)
            } catch (err) {
                server.log.error(err)
            }

            reply.status(500).send('Error reading file')
        }
    })
}