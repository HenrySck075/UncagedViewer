
let last = 100
function hi(files) {
    for (let uhh of ["back", "forward"]) {
        let c = document.getElementById(uhh)
        c.dataset.click = c.getAttribute("onclick")
        c.setAttribute("onclick","last")
    }
    let a = last-100, b=last
    if (last < 100) a = 0
    let waitText = document.getElementById("waitText")
    if (files.length != 0) {
        for (let index = a; ; index++) {
            console.log("a")
            let i = files[index]
            let cell = null
            let isFolder = i.mimeType == 'application/vnd.google-apps.folder'
            if (isFolder) {
                cell = document.getElementsByTagName("template")[1].content.cloneNode(true)
            } else {
                cell = document.getElementsByTagName("template")[0].content.cloneNode(true)
            }

            let d = document.createElement("div")
            d.id=index
            try {
                d.dataset.name = i.name
            } catch (err) {
                alert("error: "+err.message)
                continue
            }
            d.classList.add("button")
            d.classList.add("invisibleBg")
            if (isFolder) {d.classList.add("folder")}
            else {d.classList.add("file")}
            d.appendChild(cell)
            if (!isFolder) {d.getElementsByTagName("img")[0].dataset.src = `/api/thumbnails?url=${encodeURIComponent(i.thumbnailLink)}&name=${i.name}`}
            d.getElementsByTagName("p")[0].innerText = i.name
            d.dataset.id = i.id
            d.addEventListener("click", () => {
                if (isFolder) {appendHistory(i.id)}
                else {on(d.id)}
            })
            
            main.appendChild(d)

            if (index == b-1) {
                last = index+101
                break
            }
        }
        if (main.contains(waitText)) {
            main.removeChild(waitText)
        }
    }
    else {
        waitText.innerHTML = "Nothing here. Maybe look at another folders"
    }
    for (let uhh of ["back", "forward"]) {
        let c = document.getElementById(uhh)
        c.setAttribute("onclick",c.dataset.click)
    }
    dispatchEvent(you)
}
