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

    mp4_url = wd.execute_script("""
        try {
            return document.getElementsByClassName('tWeCl')[0].src
        } catch {
            return null
        }
    """)

    if (mp4_url is None):
        sys.exit("Couldn't find mp4 URL")

    wd.quit()
    return mp4_url


print(get_video_src(sys.argv[1]))
sys.stdout.flush()