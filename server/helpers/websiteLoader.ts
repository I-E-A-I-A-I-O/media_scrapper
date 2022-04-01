import { FastifyLoggerInstance } from "fastify"
import puppeteer from "puppeteer"

let PUP_BROWSER: puppeteer.Browser
let DUMMY_PAGE: puppeteer.Page

(async () => {
    PUP_BROWSER = await puppeteer.launch({ args: ['--no-sandbox'] })
    DUMMY_PAGE = await PUP_BROWSER.newPage()
})()

const cnnProcess = async (page: puppeteer.Page, logger: FastifyLoggerInstance) => {
    let selector: string | null
    logger.info(`CNN page received: ${page.url()}`)
    
    try {
        selector = '#player-large-media_0-pui-wrapper > div > div > button'
        await page.waitForSelector(selector)
    } catch (err) {
        logger.error(err)
        
        try {
            selector = '#player-fave-video1-pui-wrapper > div > div > button'
            await page.waitForSelector(selector)
        } catch (err) {
            logger.error(err)
            selector = null
        }
    }

    if (!selector) return

    await page.$eval(selector, el => (el as HTMLElement).click())
    await page.waitForTimeout(5000)
    return
}

const instagramProcess = async (url: string, page: puppeteer.Page, logger: FastifyLoggerInstance): Promise<string | null> => {
    logger.info(`Instagram page received. User url: ${url} Puppeteer url: ${page.url()}`)

    if (page.url().includes(url)) {
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
        await page.click('button[class="sqdOP  L3NKy   y3zKF     "]')
        await page.waitForSelector('video[class="tWeCl"]')
        logger.info(`Post page reached`)
        return await page.content()
    }
    else if (page.url().includes(url)) {
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
    const page = await PUP_BROWSER.newPage()
    
    try {
        let m3u8URL: string | null = null

        if (url.includes('cnn.com')) {
            const client = await page.target().createCDPSession()
            await client.send('Network.enable')
            await client.send('Network.setRequestInterception', { patterns: [{ urlPattern: '*' }] })
            client.on('Network.requestIntercepted', async (e) => {
                const rurl = e.request.url

                if (rurl.includes('.m3u8') && rurl.includes('master')) {
                    logger.info(`EVENT INFO: ${e.request.url}`)
                    m3u8URL = rurl
                }

                await client.send('Network.continueInterceptedRequest', { interceptionId: e.interceptionId })
            })
        }

        const response = await page.goto(url)

        if (response.status() !== 200) {
            logger.error(`Failed to request website. ${response.status()} ${JSON.stringify(response.headers())}`)
            return null
        }

        if (url.includes("cnn.com")) {
            await cnnProcess(page, logger)
            return m3u8URL
        }
        if (url.includes("instagram.com")) return await instagramProcess(url, page, logger)

        const content = await page.content()
        return content
    } catch(err) {
        logger.error(err)
        return null
    } finally {
        await page.close()
    }
}
