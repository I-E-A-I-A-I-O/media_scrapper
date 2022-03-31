import fs from 'fs-extra'
import path from 'path'

const BASE_DIR = path.join(__dirname, '..', '..')

export const getProxy = async (): Promise<string | null> => {
    try {
        const content = await fs.readFile(path.join(BASE_DIR, 'proxyList.txt'), { encoding: 'utf8' })
        const proxies = content.split("\n")
        return proxies[Math.floor(Math.random() * proxies.length)]
    } catch (err) {
        return null
    }
}