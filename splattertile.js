function splatterTile(tx, ty) {
    for(let cx = 0; cx < 16; cx++) {
        socket.send(JSON.stringify({
            kind: "write",
            edits: [
                [ty, tx, 0, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)],
                [ty, tx, 1, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)],
                [ty, tx, 2, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)],
                [ty, tx, 3, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)],
                [ty, tx, 4, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)],
                [ty, tx, 5, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)],
                [ty, tx, 6, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)],
                [ty, tx, 7, cx, getDate(), "█", nextObjId++, Math.floor(Math.random() * 16777215)]
            ]
        }));
    };
};
