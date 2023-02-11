function rangedRandom(min, max) {
    return min + Math.round(Math.random() *(max - min));
};

function colorSplatter(minX, maxX, minY, maxY) { //tile dimensions
    let edits = [];
    for(let x = 0; x < 16; x++) {
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 0, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 1, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 2, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 3, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 4, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 5, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 6, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])
        edits.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), 7, x, getDate(), String.fromCharCode(Math.floor(Math.random()*144000)), 0, Math.floor(Math.random() * 16777216)])

    }
    socket.send(JSON.stringify({
        kind: "write",
        edits: edits
    }));
};

// setInterval(()=>{colorSplatter(-20, 20, -20, 20)},15)
