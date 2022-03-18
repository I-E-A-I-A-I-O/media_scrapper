import sys
from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import os


def get_video_src(post_link: str):
    caps = DesiredCapabilities.CHROME
    caps['binary_location'] = os.environ.get("GOOGLE_CHROME_BIN")
    caps['goog:loggingPrefs'] = {'performance': 'ALL'}
    caps['chromeOptions'] = {
        "args": ["--headless", "--disable-dev-shm-usage", "--no-sandbox"]
    }
    s = ChromeService(ChromeDriverManager().install())
    wd = webdriver.Chrome(service=s, desired_capabilities=caps, executable_path=os.environ.get("CHROMEDRIVER_PATH"))
    wd.get(post_link)

    try:
        WebDriverWait(wd, 10).until(EC.visibility_of_element_located((By.XPATH, "//*[@class = \"_97aPb   wKWK0\"]")))
    except:
        pass

    video_tags = wd.execute_script("""
        try {
            let sources = []
            const elements = document.getElementsByClassName('tWeCl')
            
            for (let i = 0; i < elements.length; i++) {
                sources.push(elements[i].src)
            }

            return sources
        } catch {
            return null
        }
    """)

    if (video_tags is None):
        sys.exit("Couldn't find mp4 URL")

    wd.quit()
    return video_tags


tags = get_video_src(sys.argv[1])

for tag in tags:
    print(tag)

sys.stdout.flush()