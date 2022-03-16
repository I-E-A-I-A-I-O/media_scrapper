import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { FileParams } from '../types/body'
import fs from 'fs-extra'

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
        
        try {
            const data = await fs.readFile(`../media/${fileName}`)
            reply.type(getContentType(fileName))
            reply.header('Content-Disposition', `attachment; filename=${fileName}`)
            reply.send(data)
            fs.rm(fileName)
        } catch (err) {
            fs.rm(fileName)
            reply.status(500).send('Error reading file')
        }
    })
}