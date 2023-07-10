
let currentIdx=0
let files = []
const you = new Event("you")
addEventListener("you", function() {
    if (document.getElementsByClassName("folder").length != 0 && document.getElementById("folder") == null) {
        createRCCForClass("folder", [["Copy link", "navigator.clipboard.writeText(window.location.origin+'/<<data-id>>')"],["hello",""]])
    }
    if (document.getElementsByClassName("file").length != 0 && document.getElementById("file") == null) {
        createRCCForClass("file", [["Copy link", "navigator.clipboard.writeText(window.location.origin+'/file?fileId=<<data-id>>&filename=<<data-name>>')"],["Download","window.location.href = '/api/file?fileId=<<data-id>>&filename=<<data-name>>'"]])
    }
    var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));;

    if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
            let lazyImage = entry.target;
            lazyImage.src = lazyImage.dataset.src;
            lazyImage.classList.remove("lazy");
            lazyImageObserver.unobserve(lazyImage);
            }
        });
    });

    lazyImages.forEach(function(lazyImage) {
        lazyImageObserver.observe(lazyImage);
    });
    }
});

function filterUnmatch(inp) {
    let unmatches = []
    let matches = []
    files.forEach(name => {let a = Object.keys(name)[0]
        a.includes(inp) ? matches.push(a) : unmatches.push(a); })
    
    console.log({"matches": matches, "unmatches": unmatches})
    unmatches.forEach(n=> {
        document.getElementsByClassName(n)[0].style.display="none"
    })
    matches.forEach(n=> {
        document.getElementsByClassName(n)[0].style.display="initial"
    })
}

function zoomIn() {
    let img = document.getElementById("image")
    let the = + img.style.width.replace("px","")
    if (the < 2000) {
        img.style.width = `${the+50}px`
    }
}
function zoomOut() {
    let img = document.getElementById("image")
    let the = + img.style.width.replace("px","")
    if (the > 50) {
        img.style.width = `${the-50}px`
    }
}
// one-page navigation

let current = 0

let main = document.getElementById("main")

let pageHistory = {}

let woke = new Worker("/static/you.js")

function on(idx) {
    console.log(idx)
    currentIdx = idx
    let a = document.getElementById("imgViewer")
    let img = a.getElementsByTagName("img")[1]
    img.src=""
    a.style.transition = "cubic-bezier(0.19, 1, 0.22, 1) 0.5s"
    a.style.transform = "scale(1,1)"
    loadImage(idx)
}

function loadImage(idx) {
    let img = document.getElementById("imgViewer").getElementsByTagName("img")[1]
    let d = pageHistory[navHistory[current]].data
    img.src = `/api/file?fileId=${d[idx].id}&filename=${d[idx].name}`
}

function prevImg() {
    if (currentIdx > 0) {
        let img = document.getElementById("imgViewer").getElementsByTagName("img")[1]
        img.src = ""
        currentIdx--
        loadImage(currentIdx)
    }
}

function nextImg() {
    let d= pageHistory[navHistory[current]].data
    if (currentIdx < d.length-1) {
        let img = document.getElementById("imgViewer").getElementsByTagName("img")[1]
        img.src = ""
        currentIdx++
        loadImage(currentIdx)
    }
}

function off() {
    let a = document.getElementById("imgViewer")
    a.style.transition = "cubic-bezier(0.19, 1, 0.22, 1) 0.5s"
    a.style.transform = "scale(0,0)"
}
woke.onmessage = (data) => {
    if (data.data.length <= 100) {last = data.data.length}
    hi(data.data)
    pageHistory[navHistory[current]] = {node: null, data: []}
    pageHistory[navHistory[current]].node = Object.assign([],main.children)
    pageHistory[navHistory[current]].data = data.data
    let theDiv = document.getElementById("window")
    theDiv.onscroll = function(ev) {
        let dat = pageHistory[navHistory[current]].data
        if (theDiv.scrollHeight - theDiv.scrollTop - theDiv.clientHeight < 1 && (last >= 100 || main.children.length != dat.length)) {
            hi(dat)
            pageHistory[navHistory[current]].node = Object.assign([],main.children)
        }
    };
}

function navigate(idx) {
    current=idx
    if (current < 0) current = navHistory.length+current
    let waitText = newTag("p",{style:"text-align: center; margin: auto;",id:"waitText"})
    waitText.innerText = "Please wait..."
    if (main.innerHTML === null) {}
    else {main.innerHTML = ''}
    // if (main.childElementCount != 0) {
    //     for (let i of main.children) {main.removeChild(i)}
    // }
    main.appendChild(waitText)
    let forwardE = document.getElementById("forward")
    if (current == navHistory.length-1) {
        forwardE.src="/static/icons8-right-96-grayscale.png"
        forwardE.onclick = () => {}
    }
    else {
        forwardE.src="/static/icons8-right-96.png"
        forwardE.onclick = () => {forward()}
    }
    let backE = document.getElementById("back")
    if (current == 0) {
        backE.src="/static/icons8-left-96-grayscale.png"
        backE.onclick = () => {}
    }    
    else {
        backE.src="/static/icons8-left-96.png"
        backE.onclick = () => {back()}
    }
    let p = navHistory[current]
    let shjdifj = p
    if (shjdifj=="a") {shjdifj=""}
    if (p=="proplayout") {
        openProperties(0, true)
    } else if (p=="noload") {
    } else {
        window.history.pushState({}, "", `/${shjdifj}`)

        if (pageHistory[p] === undefined) {
            // if the page wasn't loaded before, make one
            woke.postMessage(p)
        } else {
            // else copy the content to main
            for (let i of pageHistory[p].node) {
                main.appendChild(i)
            }
            main.removeChild(waitText)
        }
    }
}

function appendHistory(h) {
    navHistory.push(h)
    navigate(navHistory.length-1)
}

function back() {
    navigate(current-1)
}

function forward() {
    navigate(current+1)
}

// context menu
function toggleContext(buttonId) {
    let contextMenu = document.getElementById(buttonId+"Context")
    let op = document.getElementById(buttonId)
    if (op.dataset.toggled == "false") {
        contextMenu.style.transform = "translateY(0%)"
        op.dataset.toggled = "true"
        return "a"
    } else {
        contextMenu.style.transform = "translateY(-130%)"
        op.dataset.toggled = "false"
        return "a"
    }
}
let overContextBtn = false;
function createContextMenu(buttonId, label, iconSrc, buttons) {
    let div = newTag("div", {"class": "invisibleBg"})
    let button = newTag("div", {"class": "button contextMenu", "id":buttonId, "data-toggled":"false", "style": "display:flex; justify-content:left; height: 43px; position:absolute", "onclick": `toggleContext("${buttonId}")`})
    let btnLabel = newTag("p", {"style": "margin-top:3px; margin-left:10px; margin-right:10px"})
    let btnIcon = newTag("img", {"src": iconSrc, "style": "margin:0; margin-left:10px; margin-right:10px"})
    btnLabel.innerText = label
    button.appendChild(btnIcon)
    button.appendChild(btnLabel)
    button.addEventListener("mouseenter", () => {overContextBtn = true})
    button.addEventListener("mouseleave", () => {overContextBtn = false})
    let contextContainer = newTag("div", {"style": "overflow-y: hidden; position:relative; top:86px"})
    let contextMenu = newTag("div", {"class":"micaBg", "id":`${buttonId}Context`, "style": "border-radius: 12px; transform: translateY(-130%)"})
    contextMenu.style.transition = "cubic-bezier(0.165, 0.84, 0.44, 1) 0.5s"
    for (let i of buttons) {
        let btn = newTag("p",{"class": "button","style": "height: 43px;", "onclick":`toggleContext('${buttonId}'); `+i[1]})
        btn.innerText = i[0]
        contextMenu.appendChild(btn)
    }
    contextContainer.appendChild(contextMenu)
    div.appendChild(button)
    div.appendChild(contextContainer)
    return div
}

//e

document.addEventListener("click", (e) => {
    if (e.button == 0) {
        for (let i of document.getElementsByClassName("contextMenu")) {
            if (i.dataset.toggled == "true" && !overContextBtn) {toggleContext(i.id)}
        }
    }
})
function refreshScript() {
    // styles refresh
    let s = document.head.getElementsByTagName("link")[1]
    let temp = s.href
    s.href = ""
    s.href = temp

    // scripts refresh
    let scr = document.querySelectorAll(".s")
    console.log(scr.length)
    for (let i of scr) {
        let temp = i.src
        i.remove()
        document.body.appendChild(newTag("script", {src:temp,class:'s'}))
    }
}
addEventListener("a", () => {refreshScript()})
addEventListener("keydown", (e) =>{
    if (e.key == 'r' && e.altKey) {refreshScript()}}
)
