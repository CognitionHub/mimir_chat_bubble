window.$mimirCompany = "Sprell"
window.$mimirCustomerID = "cookie3"

const mimirStyle = document.createElement('link')
mimirStyle.rel = "stylesheet"
mimirStyle.type = "text/css"
mimirStyle.href = "mimir.css"
document.getElementsByTagName('head')[0].appendChild(mimirStyle)

const mimirScript = document.createElement('script')
mimirScript.id = "mimirScript"
mimirScript.type = "text/javascript"
mimirScript.src = "mimir.js"
document.getElementsByTagName('head')[0].appendChild(mimirScript)