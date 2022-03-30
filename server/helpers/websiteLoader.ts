import { FastifyLoggerInstance } from "fastify"
import puppeteer from "puppeteer"

const instagramProcess = async (url: string, page: puppeteer.Page): Promise<string | null> => {
    if (page.url() === url) return await page.content()

    if (!page.url().includes('/login')) return null

    await page.waitForSelector('input[name="username"]')
    await page.type('input[name="username"]', process.env.INSTA_USER!)
    await page.type('input[name="password"]', process.env.INSTA_PASS!)
    await page.click('button[type="submit"]')
    await page.waitForSelector('button[class="sqdOP yWX7d    y3zKF     "]')

    if (page.url().includes('/onetap')) {
        await page.click('button[class="sqdOP yWX7d    y3zKF     "]')
        await page.waitForSelector('video[class="tWeCl"]')
        return await page.content()
    }
    else if (page.url() === url) {
        await page.waitForSelector('video[class="tWeCl"]')
        return await page.content()
    }
    else return null
}

export const loadHTML = async (url: string, logger: FastifyLoggerInstance): Promise<string | null> => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
    const page = await browser.newPage()
    
    try {
        const response = await page.goto(url)

        if (response.status() !== 200) {
            logger.error(response.statusText())
            return null
        }

        if (url.includes("instagram.com")) return await instagramProcess(url, page)

        const content = await page.content()
        return content
    } catch(err) {
        logger.error(err)
        return null
    } finally {
        await browser.close()
    }
}
