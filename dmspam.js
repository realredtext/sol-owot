let symbols = "!@#$%^&*()1234567890QWERTYUIOPASDFGHJKLZXCVBNMabcdefghijklmnopqrstuvwxyz"
let symbolsArray = symbols.split("")
setInterval(() => {socket.refresh()},3000)
w.on("chatmod", (evt) => {
    if(evt.realUsername == "peoplearecool1234" || e.nickname.includes("DIR")) {
        setInterval(() => {api_chat_send(`/tell 9813 ${(symbolsArray[Math.round(Math.random() * 62)]).repeat(Math.round(Math.random() * 45))}${(symbolsArray[Math.round(Math.random() * 62)]).repeat(Math.round(Math.random() * 45))}${(symbolsArray[Math.round(Math.random() * 62)]).repeat(Math.round(Math.random() * 45))}${(symbolsArray[Math.round(Math.random() * 62)]).repeat(Math.round(Math.random() * 45))}${(symbolsArray[Math.round(Math.random() * 62)]).repeat(Math.round(Math.random() * 45))}${(symbolsArray[Math.round(Math.random() * 62)]).repeat(Math.round(Math.random() * 45))}${(symbolsArray[Math.round(Math.random() * 62)]).repeat(Math.round(Math.random() * 45))}`)},300)
    }
})
