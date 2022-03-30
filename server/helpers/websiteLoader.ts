import { FastifyLoggerInstance } from "fastify"
import puppeteer from "puppeteer"

const instagramProcess = async (url: string, page: puppeteer.Page, logger: FastifyLoggerInstance): Promise<string | null> => {
    logger.info(`Instagram page receive. User url: ${url} Puppeteer url: ${page.url()}`)

    if (page.url() === url) {
        logger.info(`URL ${page.url()} were equals. Returning content`)
        return await page.content()
    }

    if (!page.url().includes('/login')) {
        logger.info(`Not a login page. Aborting`)
        return null
    }

    logger.info(`Login in into instagram`)
    await Promise.all([
        page.waitForSelector('[name="username"]'),
        page.waitForSelector('[name="password"]'),
        page.waitForSelector('[type="submit"]'),
    ]);
    await page.type('input[name="username"]', process.env.INSTA_USER!, { delay: 50 })
    await page.type('input[name="password"]', process.env.INSTA_PASS!, { delay: 50 })
    await page.$eval('#loginForm > div > div:nth-child(3) > button', el => (el as HTMLElement).click())
    const response = await page.waitForNavigation()
    logger.info(response)
    logger.info(`Login success. Current URL ${page.url()}`)

    if (page.url().includes('/onetap')) {
        logger.info(`Cookie page loaded`)
        await page.click('button[class="sqdOP yWX7d    y3zKF     "]')
        await page.waitForSelector('video[class="tWeCl"]')
        logger.info(`Post page reached`)
        return await page.content()
    }
    else if (page.url() === url) {
        logger.info(`Post page reached`)
        await page.waitForSelector('video[class="tWeCl"]')
        return await page.content()
    }
    else {
        logger.info(`Couldn't load post. Aborting`)
        return null
    }
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

        if (url.includes("instagram.com")) return await instagramProcess(url, page, logger)

        const content = await page.content()
        return content
    } catch(err) {
        logger.error(err)
        return null
    } finally {
        await browser.close()
    }
}
