function rangedRandom(min, max) {
    return min + Math.round(Math.random() *(max - min));
};

function colorRandomTile(minX, maxX, minY, maxY) {
    for(let e = 0; e < 8; e++) {
        for(let i = 0; i < 16; i++) {
            writeBuffer.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX) x, e, i, Date.now, "█", nextObjId, color]);
        };
    };
};

// setInterval(()=>{colorRandomTile(-20, 20, -20, 20)},1000)
