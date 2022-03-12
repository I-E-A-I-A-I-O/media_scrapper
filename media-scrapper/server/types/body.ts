export const ResponseBody = {
    type: 'object',
    properties: {
        url: { type: 'string' }
    }
} as const

export const FileParams = {
    type: 'object',
    properties: {
        fileName: { type: 'string' }
    },
    additionalProperties: false,
    required: ['fileName']
} as const