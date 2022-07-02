function writeRand(dist) {
    let symbs = "`1234567890-=+~!@#$%^&*()_+QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?|".split("");
        writeCharToXY(symbs[Math.round(Math.random() * symbs.length)], int_to_hexcode(Math.round(Math.random() * 16777216)), !!Math.round(Math.random())?Math.round(Math.random() * dist): -Math.round(Math.random() * dist), !!Math.round(Math.random())?Math.round(Math.random() * dist): -Math.round(Math.random() * dist))
}
