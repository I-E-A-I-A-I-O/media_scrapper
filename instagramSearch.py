import sys
from bs4 import BeautifulSoup
import os


def get_video_src(html_sourcefile: str):
    file = open(html_sourcefile)
    page_content = file.read()
    file.close()
    os.remove(html_sourcefile)
    soup = BeautifulSoup(page_content, 'html.parser')
    elements = soup.find_all("video", attrs={"class": "tWeCl"})
   
    for element in elements:
        print(element["src"])
        sys.stdout.flush()

get_video_src(sys.argv[1])