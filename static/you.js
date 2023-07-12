onmessage = (d) => {
    let http = new XMLHttpRequest()
    http.open("GET", `/api/folder/${d.data}`, false);
    http.send()
    if (http.status == 200) {
        let data = JSON.parse(http.responseText)
        postMessage([data, http.getResponseHeader("x-powered-by") == null])
    }
}