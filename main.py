from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import sys


def get_video_src(base: str):
    caps = DesiredCapabilities.CHROME
    caps['goog:loggingPrefs'] = {'performance': 'ALL'}
    s = ChromeService(ChromeDriverManager().install())
    wd = webdriver.Chrome(service=s, desired_capabilities=caps)
    wd.get(base)
    WebDriverWait(wd, 10).until(EC.visibility_of_element_located((By.XPATH, "//button[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw cnBpEa\"]")))
    button_element = wd.find_element(By.XPATH, "//button[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw cnBpEa\"]")
    button_element.click()

    time.sleep(5)

    reqs = wd.requests
    m3u8_url = next((x for x in reqs if x.url.__contains__("hls_master")), "")

    wd.quit()
    return m3u8_url


print(get_video_src(sys.argv[1]))
sys.stdout.flush()