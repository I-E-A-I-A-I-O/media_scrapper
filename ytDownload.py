from pytube import YouTube
import sys
from datetime import datetime

try:
    link = sys.argv[1]
    type = sys.argv[2]

    if (type != "video" and type != "audio"):
        sys.exit("invalid argument type argument")

    video = YouTube(link)
    now = datetime.now().__str__()
    
    if (type == "video"):
        stream = video.streams.get_highest_resolution()
        now = now.__add__(".mp4")
    else:
        stream = video.streams.get_audio_only()
        now = now.__add__(".mp3")

    stream.download("./dist/media", now.__str__())
    print(now)
    sys.stdout.flush()
except:
    sys.exit("Error downloading video")