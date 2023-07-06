import requests
import datetime as dt
from flask import Flask, render_template_string, request, Response
from bs4 import BeautifulSoup
import idk#, click, logging
from io import BytesIO
from googleapiclient.http import MediaIoBaseDownload
from urllib.parse import unquote

drive = idk.create_service("client_secret.json", "drive", 'v3', ["drive.file","drive.photos.readonly","drive.readonly","drive.metadata","drive","drive.readonly","drive.appdata"])
a = Flask(__name__)

# def secho(text, file=None, nl=None, err=None, color=None, **styles):
#     pass

# def echo(text, file=None, nl=None, err=None, color=None, **styles):
#     pass

# click.echo = echo
# click.secho = secho

# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)

thumbnailCache = {}
def sizeof_fmt(num, suffix="B"):
    for unit in ("", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"):
        if abs(num) < 1024.0:
            return f"{num:3.1f}{unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f}Yi{suffix}"
@a.route("/")
def main():
    template = BeautifulSoup(open("main.html", "r").read(), 'html.parser')

    return render_template_string(template.prettify())

@a.route("/<folder>")
def subfolder(folder):
    template = BeautifulSoup(open("main.html", "r").read(), 'html.parser')
    template.find(id="navigationHistory").string = f"let navHistory=['a','{folder}'];"
    template.find(id="main").attrs["data-current"] = folder
    return render_template_string(template.prettify())

def subfolderFetch(folderId):
    if folderId == "\u000a": return []
    if folderId == "a": folderId = "1-1aFpPpcGzW7ifhGXYyEzD3mSwwlHM6i"

    files = []
    pageToken = None
    while True:
        resp = drive.files().list(q=f"'{folderId}' in parents", fields="nextPageToken, files(id,mimeType,name,thumbnailLink,size,createdTime,modifiedTime)", pageToken = pageToken).execute()
        for i in resp["files"]:
            for arg in ["createdTime", "modifiedTime"]:
                d=dt.datetime.strptime(i[arg], '%Y-%m-%dT%H:%M:%S.%fZ')
                i[arg] = [d.strftime("%b %d, %Y - %H:%M:%S"), int(d.timestamp())]
            try: i["size"] = sizeof_fmt(int(i["size"]))
            except:pass
        files.extend(resp["files"])
        pageToken = resp.get("nextPageToken", None)
        if pageToken == None: break
    return files

@a.route("/test")
def test(): return render_template_string(open("test.html","r").read())

@a.route("/api/folder/<folder>")
def subfolderEndpoint(folder):
    return subfolderFetch(folder.replace(" ", ""))

@a.route("/api/thumbnails")
def loadThumbnails():
    thumbnailLink = request.args.get("url")
    fileName = request.args.get("name")
    if fileName not in thumbnailCache:
        thumbnailCache[fileName] = requests.get(unquote(thumbnailLink),headers={"upgrade-insecure-requests":"1"}).content

    return Response(thumbnailCache[fileName],mimetype="image/png",headers={"Content-Disposition":"attachment;filename=thumbnail.png"})

@a.route("/api/file")
def getFullFile():
    fileId = request.args.get("fileId")
    filename = request.args.get("filename")
    req = drive.files().get_media(fileId=fileId, acknowledgeAbuse=True)
    file = BytesIO()
    downloader = MediaIoBaseDownload(file, req)
    done = False
    while done == False:
        _, done = downloader.next_chunk()
    
    return Response(file.getvalue(),
                       mimetype="image/png",
                       headers={"Content-Disposition":
                                    f"attachment;filename={filename}"})
    

a.run(port=5000, debug=True)
