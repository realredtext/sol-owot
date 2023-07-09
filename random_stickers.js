function writeRand(dist) {
        writeCharToXY(String.fromCharCode(Math.floor(Math.random()*144000)), Math.round(Math.random() * 16777215), !!Math.round(Math.random())?Math.round(Math.random() * dist): -Math.round(Math.random() * dist), !!Math.round(Math.random())?Math.round(Math.random() * dist): -Math.round(Math.random() * dist))
}
//setInterval(()=>{writeRand(100)},50)
