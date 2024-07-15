function randWrite(density) {
    moveCursor([null, "left", "right", "down", "up"][Math.floor(Math.random() * 5)], false, Math.round(Math.random() * density));
    writeChar((`1234567890-=QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm`.split(""))[Math.round(Math.random() * 64)], false, Math.round(Math.random() * 16777215), true);
    !!Math.round(Math.random())?moveCursor("left"):moveCursor(!!Math.round(Math.random())?"up":"down")
}

//setInterval(()=>{randWrite(3)})
