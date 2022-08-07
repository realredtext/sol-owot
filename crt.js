function rangedRandom(min, max) {
    return min + Math.round(Math.random() *(max - min));
};

function colorSplatter(minX, maxX, minY, maxY) { //tile dimensions
    for(let e = 0; e < 8; e++) {
        for(let i = 0; i < 16; i++) {
            writeBuffer.push([rangedRandom(minY, maxY), rangedRandom(minX, maxX), e, i, Date.now, "█", nextObjId, Math.round(Math.random() * 16777214)]);
        };
    };
};

// setInterval(()=>{colorSplatter(-20, 20, -20, 20)},1000)
