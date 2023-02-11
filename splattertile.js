function splatterTile(tx, ty) {
    let edits = [];
    for(let cx = 0; cx < 16; cx++) {
        edits.push([ty, tx, 0, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
        edits.push([ty, tx, 1, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
        edits.push([ty, tx, 2, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
        edits.push([ty, tx, 3, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
        edits.push([ty, tx, 4, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
        edits.push([ty, tx, 5, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
        edits.push([ty, tx, 6, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
        edits.push([ty, tx, 7, cx, getDate, "█", 1, Math.floor(Math.random()*16777215)]);
    };
    socket.send(JSON.stringify({
        kind: "write",
        edits: edits
    }));
};
