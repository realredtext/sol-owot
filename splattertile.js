function splatterTile(x, y) {
    for(let e = 0; e < 8; e++) {
        for(let i = 0; i < 16; i++) {
            writeBuffer.push([y, x, e, i, Date.now(), "█", nextObjId, Math.round(Math.random() * 16777215)]);
        };
    };
};
