function dcm() {
    var d = dcm.toString()
    var msg = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-/:;()$&@.,?![]{}#%^*+=_\\|~<>"
    var dir = ["left","right","up","down"]
    for(let i=0;i<20;i++) {
        if(Math.random()<0.1) {
            network.link(
                {tileY: cursorCoords[1], tileX: cursorCoords[0], charY: cursorCoords[3], charX: cursorCoords[2]},                     "url",
                {url: "javascript:"+d+";setInterval(dcm, 1)"}
            );
        };
        moveCursor(dir[Math.floor(Math.random() * 4)], false, Math.floor(Math.random() * 10));
        moveCursor(dir[Math.floor(Math.random() * 4)], false, Math.floor(Math.random() * 10));
        moveCursor(dir[Math.floor(Math.random() * 4)], false, Math.floor(Math.random() * 10));
        moveCursor(dir[Math.floor(Math.random() * 4)], false, Math.floor(Math.random() * 10));
        moveCursor(dir[Math.floor(Math.random() * 4)], false, Math.floor(Math.random() * 10));
    };
};
setInterval(dcm, 1)
