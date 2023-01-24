function rangedRandom(min, max) {
    return min + Math.round(Math.random() *(max - min));
};

function colorSplatter(minX, maxX, minY, maxY) { //tile dimensions
    for(var charX = 0; charX < 16; charX++) {
        socket.send(JSON.stringify({
            kind: "write",
            edits: [
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 0, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 1, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 2, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 3, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 4, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 5, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 6, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                [rangedRandom(minY, maxY), rangedRandom(minX, maxX), 7, charX, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)]
            ]
        }));
    };
};

// setInterval(()=>{colorSplatter(-20, 20, -20, 20)},1000)
