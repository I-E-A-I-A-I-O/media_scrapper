from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import sys


def get_video_src(base: str = "https://edition.cnn.com/videos/us/2022/03/02/ks-4-year-old-case-of-the"
                              "-mondays-viral-affil-dnt-vpx.kwch?iid=edition_homepage_video_zone-outbrain"
                              "&dicbo=v1-b22602622d2dbedece7658fc1a5e98bd"
                              "-006234a14302a1982f4b90e0580f9aaeb2"
                              "-mnrtmzbymnstellcgmytsljugzrgmljygjqtoljsg43dczlgge3timrrme"):

    caps = DesiredCapabilities.CHROME
    caps['goog:loggingPrefs'] = {'performance': 'ALL'}
    s = ChromeService(ChromeDriverManager().install())
    wd = webdriver.Chrome(service=s, desired_capabilities=caps)
    wd.get(base)
    WebDriverWait(wd, 10).until(EC.visibility_of_element_located((By.ID, "player-large-media_0-pui-wrapper")))
    button_element = wd.find_element(By.XPATH, "//button[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw cnBpEa\"]")
    button_element.click()

    time.sleep(5)

    reqs = wd.requests
    m3u8_url = next((x for x in reqs if x.url.__contains__("hls_master")), "")

    wd.quit()
    return m3u8_url


print(get_video_src())
sys.stdout.flush()