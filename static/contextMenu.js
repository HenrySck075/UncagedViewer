let previousType = ""
let contextContainerTmp = newTag("div", {style:"overflow-y: hidden; position:fixed", id:"container", "data-toggled":"false", class:"contextMenu"})
contextContainerTmp.appendChild(newTag("div", {class:"micaBg contextMenu", id:"containerContext", style:"border-radius: 12px; transform: translateY(-130%); transition: cubic-bezier(0.165, 0.84, 0.44, 1) 0.5s"}))
let avaPropWin = []
function newTag(tag, attrs) {
    let elem = document.createElement(tag)
    for (let i of Object.keys(attrs)) {
        if (i != "innerText") {
            elem.setAttribute(i,attrs[i])
        } else {
            elem.innerText = attrs[i]
        }
    }
    return elem
}

function openF(n,m,o) {
    if (n == 'folder') {appendHistory(m)}
    else {on(o)}
}
function openProperties(idx,test=false) {
    let winIdx = 0
    if (avaPropWin != []) {
        while (avaPropWin.includes(winIdx)) {winIdx++}
    }
    avaPropWin.push(winIdx)
    let propWin = newTag("div", {"id": `properties${winIdx}`,"class": "micaBg", "style": "width: 600px; height: 70vh; transition: opacity 0.5s; transform-origin: center center; opacity: 0; transform: scale(0.8,0.8); left: 50%; top: 50%; display: inline-block; z-index: -2; position:fixed"})
    document.getElementById("uiMain").appendChild(propWin)
    function how(c, tag, attrs, moreThings=null) {
        let a = newTag(tag, attrs)
        if (moreThings != null) {
            a = moreThings(a)
        }
        c.appendChild(a)
    }

    let d = pageHistory[navHistory[current]].data[idx]
    let titleBar = newTag("div", {id:`propDraggable${winIdx}`,style:"display: flex; justify-content: left;"})
    titleBar.appendChild(newTag("p", {"style": "margin-left: 35px;", "innerText": d.name+" Properties"}))
    titleBar.appendChild(newTag("img", {"style": "margin: 20px; width: 40px; height: 40px; margin-left: auto;", "onclick":`closeProperties('properties${winIdx}')`, "ontouchstart":`closeProperties('properties${winIdx}')`, src:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC2ElEQVR4nO3YXU/TUBgH8H2DEaXtjQkMI0EFuu4UNrpCO8ZeKIwBY0C48bOp10oiF3KhQLfEzAviRzABBnQvHT3t/WMqVA2EttuOyy72T3p78svp87TPOYHAIIP0cVr5N0PW2t57M7dzYii7UVLrNpAc1biFkxo7/67FSkMdLaIXi0Ezt1cxc7tgru6AuVK0zJWC3C1OQ3Jc4yRcYxdAmxbh+rVwevYq9qRL3DZgpQg4W7Bamc6R2j2cNhm3gXD9Muof+ThuC4xMAYz0htVK5mVyuBhcTUThanzGH/K25h7DbYKR2oCbpXWsL62L/nGS6IGDyxc8VMcibz0XM1d3VQ8c3CzmoZXIYV1aFUnhLp8jqIa4Y0+g3a2msm2649agJeegJSlYj2dFEriLUc48H53296UwlIKAM1vYHbcC+rwCenzZqsczD2pS4xOCb1yIs85H2Pbq2kgXBCO1iV1x4jI0hSw059JWPZqUe4b7i8wLdkN44KARTUFjdtGqo6TcM5wTu1vthnDHJaHOL0ItksDt1Fx1bNr3l8A1zURe+N0QLrg6SkCNk6BnO/cAOa8IupjFfYlz0pxLC81YCvcl7l9kYyaJ+xLnxO5UuyFq/YhzgH679SzEWfvDU5X9pz3cvXZwH4anfnykWPg0HLY+M/8Z2SnugArDIc3BVwpZZQbJ/YmjEZQYHko0Tx7pY9gEXzjnIYlsB3dx2xDfXXF3j8ogXKaQ2FPc+Qgr71Nh4YAKYzcckZ3sBBe4yyEVFr7QEeyK6wbZDc6JSvGC/RqJIxsRKVbjFkwSI1OZQqJvJMObJQZ5j/xaWFJJznPlNpAqzXsfmuzrCNLDZtknUmV472OnjpaC2qRQIf3jV71qkuZPvz3ze7uAUPB6IlYhPZWojyHbwf1BjqHg5fhMhfTIpN5HdoJz8nOEHbKvI6oh7sj3odpH7G4t0fyRXXPHQbaz67dBBgn0Jr8AI45VYAK3zzsAAAAASUVORK5CYII="}))

    let propMain = newTag("div", {style:"margin:auto; margin-top: 20px; width: 85%; height: 85%;"})
    how(propMain, "input", {value: d.name, class: "micaBg"}, (a) => {a.disabled=true;return a})
    how(propMain, "p", {innerText: "Type: " + (d.mimeType == "application/vnd.google-apps.folder" ? "Folder" : "File"),style:"font-size:25px"})
    how(propMain, "p", {innerText: "Size: " + d.size ,style:"font-size:25px"})
    how(propMain, "p", {innerText: "Created: " + d.createdTime[0],style:"font-size:25px"})
    how(propMain, "p", {innerText: "Last modified: " + d.modifiedTime[0],style:"font-size:25px"})

    propWin.appendChild(titleBar)
    propWin.appendChild(propMain)

    propWin.style.transition = "cubic-bezier(0.19, 1, 0.22, 1) 0.5s"
    propWin.style.transform = "scale(1,1)"
    propWin.style.opacity = "1"
    propWin.style.zIndex = "4"

    
    makeDragable(`#propDraggable${winIdx}`, `#properties${winIdx}`)
}
function closeProperties(i) {
    let propWin = document.getElementById(i);
    // propWin.style.transition = "cubic-bezier(0.95, 0.05, 0.795, 0.035) 0.3s"
    propWin.style.transform = "scale(0.8,0.8)"
    propWin.style.opacity = "0"
    propWin.style.zIndex = "-2"
    propWin.addEventListener("transitionend", (e)=>{propWin.remove()})
}
function createRCCForClass(className,buttons) {
    let contextContainer = contextContainerTmp.cloneNode(true)
    let contextMenu = contextContainer.querySelectorAll("div")[0]
    contextContainer.id = className
    contextMenu.id = className+"Context"
    contextMenu.dataset.btns = JSON.stringify(buttons)
    let t = document.getElementsByClassName(className)
    for (let elem of t) {
        elem.oncontextmenu = (e) => {
            e.preventDefault()
            contextMenu.innerHTML = ""
            if (contextContainer.dataset.toggled == "false") {
                let btn = newTag("p",{"class": "button","style": "height: 43px;", "onclick":`toggleContext('${className}'); openF('${className}','${elem.dataset.id}',${elem.id})`})
                btn.innerHTML = "<strong>Open</strong>"
                contextMenu.appendChild(btn)
                for (let i of JSON.parse(contextMenu.dataset.btns)) {
                    let btn = newTag("p",{"class": "button","style": "height: 43px;", "onclick":`toggleContext('${className}'); `+i[1]})
                    btn.innerText = i[0]
                    contextMenu.appendChild(btn)
                }
                let propBtn = newTag("p",{"class": "button","style": "height: 43px;", "onclick":`toggleContext('${className}'); openProperties(${elem.id})`})
                propBtn.innerHTML = "Properties"
                contextMenu.appendChild(propBtn)
            }
            toggleContext(className)
        }
    }
    
    document.body.addEventListener("mousemove", (e) => {
        if (contextContainer.dataset.toggled == "false") {
            let xPos = e.pageX, yPos = e.pageY
            contextContainer.setAttribute("style", `left: ${xPos+10}px; top: ${yPos+10}px; overflow-y: hidden; position:fixed`)
        }
    }) 
    document.body.appendChild(contextContainer)
}