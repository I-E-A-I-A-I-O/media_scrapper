import { FastifyPluginAsync } from 'fastify'
import { FromSchema } from 'json-schema-to-ts'
import { FileParams } from '../types/body'
import fs from 'fs'
import utils from 'util'

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
            const readfile = utils.promisify(fs.readFile)
            const data = readfile(`../media/${fileName}`)
            reply.type(getContentType(fileName))
            reply.header('Content-Disposition', `attachment; filename=${fileName}`)
            reply.send(data)
            const rm = utils.promisify(fs.rm)
            rm(fileName)
        } catch (err) {
            const rm = utils.promisify(fs.rm)
            rm(fileName)
            reply.status(500).send('Error reading file')
        }
    })
}