import { FastifyLoggerInstance } from "fastify"
import puppeteer from "puppeteer"

export const loadHTML = async (url: string, logger: FastifyLoggerInstance): Promise<string | null> => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    const page = await browser.newPage()
    
    try {
        const response = await page.goto(url)

        if (response.status() !== 200) {
            logger.error(response.statusText())
            return null
        }

        const content = await page.content()
        return content
    } catch(err) {
        logger.error(err)
        return null
    } finally {
        await browser.close()
    }
}
