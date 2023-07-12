const {create_service} = require("./idk.js")
const express = require('express')
const app = express()
const cheerio = require("cheerio")
const aaa = require("domutils")
const fs = require("fs")
const moment = require("moment")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var timeout = require('connect-timeout'); //express v4


create_service("client_secret.json", "drive", "v3", ["drive.file","drive.photos.readonly","drive.readonly","drive.metadata","drive","drive.readonly","drive.appdata"]).then(async drive =>{
  app.use(timeout(120000));
  let a= (await drive.files.list({
    q:"name = 'Uncaged Library'", 
    fields:"files(id)",
    spaces: "drive",
    pageSize: 20
  })).data
  console.log(a)
  const root = a.files[0].id
  const html = fs.readFileSync("./main.html").toString()
  let thumbnailCache = {}

  function sizeof_fmt(num, suffix="B") {
    for (let unit of ["", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"]) {
      if (Math.abs(num) < 1024) {return `${num}${unit}${suffix}`}
      num /= 1024
    }
    return `${num}Yi${suffix}`
  }
  app.use((req,_,next) => {
    console.log(`${req.ip} - - [${new Date().toString()}] "${req.method} ${req.path}" -`)
    next()
  })
  app.use("/static", express.static("static"))

  // main
  app.get('/', (req, res) => {
    res.setHeader("content-type", "text/html")
    console.log("aaaa")
    res.send(html)
  })

  // subfolder
  app.get('/:folder', (req,res) => {
    let folder = req.params.folder

    let template = cheerio.load(html, null ,true)
    template("#nav").text(`let navHistory=['a','${folder}'];`)
    template("#main").data("current", folder)
    res.send(template.html())
  })

  // viewFile
  app.get("/file", (req,res) => {
    let template = cheerio.load(html, null ,true)
    template("#nav").text("let navHistory=['noload']")
    template("#window").css("display","none")
    template("#serverMod").text(`pageHistory.noload={data: [{id: '${req.query.id}', name: '${req.query.name}' }]};on(0)`)
    template("#imgViewerHead > img").css("display","none")
    template(".noidea").each((idx,i)=>{i.css("display","none")})
    res.send(template.html())
  })

  // subfolderEndpoint
  app.get("/api/folder/:folderId", async (req,res) => {
    let folderId = req.params.folderId
    if (folderId == "\u000a") {return []}
    if (folderId == "a") {folderId = root}

    let files = (await drive.files.list({
      q: `'${folderId}' in parents`, spaces: "drive",
      fields: "nextPageToken, files(id,mimeType,name,thumbnailLink,size,createdTime,modifiedTime)"
    })).data.files

    for (let i of files) {
      for (arg of ["createdTime", "modifiedTime"]) {
        let d=moment(i[arg], "YYYY-MM-DDTHH:mm:ssZ")
        i[arg] = [d.utc().format("MMM DD, YYYY - HH:mm:ss"), d.unix()]
      }
      if ("size" in i) {i.size = sizeof_fmt(+i.size)}
    }
    res.send(files)
  })

  // loadThumbnails
  app.get("/api/thumbnails", async (req,res) => {
    let thumbnailLink = req.query.url
    let fileName = req.query.name
    if (!(fileName in thumbnailCache)) {
      var content = await (await fetch(decodeURIComponent(thumbnailLink), {method:'GET', headers:{"upgrade-insecure-requests":"1"}})).blob()
      thumbnailCache[fileName] = content
    }
    res.type(thumbnailCache[fileName].type)
    res.send(Buffer.from(await thumbnailCache[fileName].arrayBuffer()))
  })

  // getFullFile
  app.get("/api/file", async (req,res) => {
    let fileId = req.query.fileId
    let filename = req.query.filename
    drive.files.get({fileId: fileId, alt: 'media'},{responseType:"stream"},(err,content)=>{
      let buf = []
      content.data.on("data", (e)=>{buf.push(e)})
      content.data.on("end", ()=>{
        let buffer = Buffer.concat(buf)
        res.setHeader("content-type", content.headers['content-type'])
        res.setHeader("content-disposition", `attachment;filename=${filename || "tuanlolicon."+content.headers['content-type'].split("/").slice(-1)[0]}`)
        res.send(buffer)
      })
    })
  })
  app.listen(5002, "localhost", ()=>{})
})