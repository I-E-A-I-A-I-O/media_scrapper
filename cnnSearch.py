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
    xPath = ""

    if (base.__contains__('cnnespanol.cnn.com')):
        xPath = "//*[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw iCGaIi\"]"
    else:
        xPath = "//*[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw cnBpEa\"]"

    print(xPath)
    caps = DesiredCapabilities.CHROME
    caps['goog:loggingPrefs'] = {'performance': 'ALL'}
    s = ChromeService(ChromeDriverManager().install())
    wd = webdriver.Chrome(service=s, desired_capabilities=caps)
    wd.get(base)
    WebDriverWait(wd, 10).until(EC.visibility_of_element_located((By.XPATH, "//*[@class = \"player-large-media_0-pui-wrapper\"]")))
    button_element = wd.find_element(By.XPATH, xPath)
    button_element.click()

    time.sleep(15)

    reqs = wd.requests
    m3u8_url = next((x for x in reqs if x.url.__contains__("hls_master")), "")
    iterations = 0

    while m3u8_url == "":
        if (iterations > 10):
            sys.exit("Too many tries. Timeout.")
        
        iterations += 1
        reqs = wd.requests
        m3u8_url = next((x for x in reqs if x.url.__contains__("hls_master")), "")
        time.sleep(2)

    wd.quit()
    return m3u8_url


print(get_video_src(sys.argv[1]))
sys.stdout.flush()