from bs4 import BeautifulSoup
import sys
import os
import json

def get_video_src(html_sourcefile: str):
    file = open(html_sourcefile)
    page_content = file.read()
    file.close()
    os.remove(html_sourcefile)
    soup = BeautifulSoup(page_content, 'html.parser')
    elements = soup.find_all("script")
    for element in elements:
        contents = element.contents

        if len(contents) == 0:
            continue

        contents = contents[0]

        if contents.__contains__("window.contextlayer = "):
            toJson = json.loads(contents[contents.index("=") + 1:])
            print(toJson["social"]["podcast_links"][3]["url"])
            sys.stdout.flush()
            return
        else:
            url = ""
            try:
                toJson = json.loads(contents)
                parsedUrl = toJson["sources"][0]["url"]
                if not parsedUrl.__contains__(".ice."):
                    url = parsedUrl
            except:
                pass
            finally:
                if url.__len__() > 0:
                    print(url)
                    sys.stdout.flush()


get_video_src(sys.argv[1])