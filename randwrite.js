function randWrite(density) {
    moveCursor(["left", "right", "down", "up"][Math.floor(Math.random() * 4)], false, Math.round(Math.random() * density));
    writeChar((`1234567890-=QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm`.split(""))[Math.round(Math.random() * 64)], false, int_to_hexcode(Math.round(Math.random() * 16777215)), true)
}
