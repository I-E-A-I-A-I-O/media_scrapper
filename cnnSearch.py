from seleniumwire import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time
import sys
import os

def get_video_src(base: str):
    primary = ""
    secondary = ""

    if (base.__contains__("edition.cnn.com")):
        primary = "//*[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw iCGaIi\"]"
        secondary = "//*[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw cnBpEa\"]"
    else:
        primary = "//*[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw cnBpEa\"]"
        secondary = "//*[@class = \"pui_center-controls_big-play-toggle sc-iAyFgw iCGaIi\"]"

    caps = DesiredCapabilities.CHROME
    caps['binary_location'] = os.environ.get("GOOGLE_CHROME_BIN")
    caps['goog:loggingPrefs'] = {'performance': 'ALL'}
    caps['chromeOptions'] = {
        "args": ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu", "--window-size=1920,1080"]
    }
    s = ChromeService(ChromeDriverManager().install())
    wd = webdriver.Chrome(service=s, desired_capabilities=caps, executable_path=os.environ.get("CHROMEDRIVER_PATH"))
    wd.set_window_size(1920, 1080)

    try:
        wd.get(base)
        #wd.execute_script("window.scrollBy(0, 250)")
        WebDriverWait(wd, 180).until(EC.visibility_of_element_located((By.XPATH, "//*[@title = \"Play\"]")))
    except:
        pass
    finally:
        try:
            button_element = wd.find_element(By.XPATH, primary)
            button_element.click()
        except:
            try:
                button_element = wd.find_element(By.XPATH, secondary)
                button_element.click()
            except:
                sys.exit("Couldn't find play button")


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