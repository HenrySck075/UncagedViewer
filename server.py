import requests
import datetime as dt
from flask import Flask, render_template_string, request, send_file, Response
from bs4 import BeautifulSoup
import idk#, click, logging
from io import BytesIO
from magic import from_buffer
from googleapiclient.http import MediaIoBaseDownload
from urllib.parse import unquote

drive = idk.create_service("client_secret.json", "drive", 'v3', ["drive.file","drive.photos.readonly","drive.readonly","drive.metadata","drive","drive.readonly","drive.appdata"])
root = drive.files().list(q="name = 'Uncaged Library'", fields="files(id)").execute()["files"][0]["id"]
a = Flask(__name__)
html = open("main.html", "r").read()
thumbnailCache = {}

def sizeof_fmt(num, suffix="B"):
    for unit in ("", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"):
        if abs(num) < 1024.0:
            return f"{num:3.1f}{unit}{suffix}"
        num /= 1024.0
    return f"{num:.1f}Yi{suffix}"
@a.route("/")
def main():
    template = BeautifulSoup(html, 'html.parser')
    return render_template_string(template.prettify())

@a.route("/<folder>")
def subfolder(folder):
    template = BeautifulSoup(html, 'html.parser')
    template.find(id="nav").string = f"let navHistory=['a','{folder}'];"
    template.find(id="main").attrs["data-current"] = folder
    return render_template_string(template.prettify())

@a.route("/file")
def viewFile():
    template = BeautifulSoup(html, 'html.parser')
    template.find(id="nav").string = "let navHistory=['noload'];"
    template.find(id="window").attrs["style"] = "display:none"
    template.find(id="serverMod").string = "pageHistory.noload={{data: [{{id: '{id}', name: '{name}' }}]}};on(0)".format(id=request.args.get("fileId","null"), name=request.args.get("filename","null"))
    template.find(id="imgViewerHead").find("img").attrs["style"] = 'display:none'
    for i in template.findAll(attrs={"class":"noidea"}): i.attrs["style"] = "display:none"
    return render_template_string(template.prettify())

@a.route("/test")
def test(): return render_template_string(open("test.html","r").read())

@a.route("/api/folder/<folderId>")
def subfolderEndpoint(folderId):
    folderId = folderId.replace(" ", "")
    if folderId == "\u000a": return []
    if folderId == "a": folderId = root 

    files = []
    pageToken = None
    while True:
        resp = drive.files().list(q=f"'{folderId}' in parents", fields="nextPageToken, files(id,mimeType,name,thumbnailLink,size,createdTime,modifiedTime)", pageToken = pageToken).execute()
        for i in resp["files"]:
            for arg in ["createdTime", "modifiedTime"]:
                d=dt.datetime.strptime(i[arg], '%Y-%m-%dT%H:%M:%S.%fZ')
                i[arg] = [d.strftime("%b %d, %Y - %H:%M:%S"), int(d.timestamp())]
            if "size" in i: i["size"] = sizeof_fmt(int(i["size"]))
        files.extend(resp["files"])
        pageToken = resp.get("nextPageToken", None)
        if pageToken == None: break
    return files

@a.route("/api/thumbnails")
def loadThumbnails():
    thumbnailLink = request.args.get("url")
    fileName = request.args.get("name")
    if fileName not in thumbnailCache:
        thumbnailCache[fileName] = requests.get(
            unquote(thumbnailLink),
            headers={"upgrade-insecure-requests":"1"}
        ).content

    return send_file(BytesIO(thumbnailCache[fileName]), as_attachment=True, download_name="thumbnail."+fileName.split(".")[0])

@a.route("/api/file")
def getFullFile():
    fileId = request.args.get("fileId")
    filename = request.args.get("filename", None)
    req = drive.files().get_media(fileId=fileId, acknowledgeAbuse=True)
    file = BytesIO()
    downloader = MediaIoBaseDownload(file, req)
    done = False
    while done == False:
        _, done = downloader.next_chunk()
    
    return Response(file.getvalue(), mimetype=f"image/{filename.split('.')[-1]}", headers={"Content-Disposition": f"attachment;filename={filename or 'tuanlolicon.'+from_buffer(file.read(1024),mime=True).split('/')[1]}"})
    

a.run(port=5000, debug=True)
