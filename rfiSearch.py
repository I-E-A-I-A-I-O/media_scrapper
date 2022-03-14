from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import sys


def get_video_src(base: str):
    caps = DesiredCapabilities.CHROME
    caps['goog:loggingPrefs'] = {'performance': 'ALL'}
    caps['chromeOptions'] = {
        "args": ["--headless", "--disable-gpu", "--dump-dom"]
    }
    s = ChromeService(ChromeDriverManager().install())
    wd = webdriver.Chrome(service=s, desired_capabilities=caps, )
    wd.get(base)

    try:
        WebDriverWait(wd, 10).until(EC.visibility_of_element_located((By.XPATH, "//*[@id = \"didomi-notice-agree-button\"]")))
    except:
        pass

    mp3_url = wd.execute_script("""
        try {
            return window.contextlayer.social.podcast_links[3].url
        } catch {
            return null
        }
    """)

    if (mp3_url is None):
        mp3_url = wd.execute_script(""" 
            const elements = window.document.getElementsByTagName("script")
            let url = ""

            for (let i = 0; i < elements.length; i++) {
                try {
                    const parsed = JSON.parse(elements[i].innerHTML).sources[0].url
                    if (!parsed.includes('.ice.')) url = parsed
                } 
                catch {}
                finally {
                    if (url.length > 0) return url
                }
            }

            return null
        """)

    if (mp3_url is None):
        sys.exit("Couldn't find mp3 URL")

    wd.quit()
    return mp3_url


print(get_video_src(sys.argv[1]))
sys.stdout.flush()