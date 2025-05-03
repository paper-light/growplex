import subprocess

url = "https://www.youtube.com/watch?v=XO2dqFBDDd4"
cookies_path = "cookies.txt"

subprocess.run(
    [
        "yt-dlp",
        "--cookies",
        cookies_path,
        "-f",
        "bestaudio",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--no-playlist",
        "-o",
        "../../data/yt/%(title)s/audio.%(ext)s",
        url,
    ]
)
