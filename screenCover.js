for(const i in tiles) {
    const [ty, tx] = i.split(",").map(num => Number(num));

    for(var x = 0; x < 16; x++) {
        socket.send(JSON.stringify({
            kind: "write",
            edits: [[ty, tx, 0, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                   [ty, tx, 1, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                   [ty, tx, 2, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                   [ty, tx, 3, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                   [ty, tx, 4, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                   [ty, tx, 5, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                   [ty, tx, 6, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)],
                   [ty, tx, 7, x, Date.now(), String.fromCharCode(Math.floor(Math.random()*144000)), 10, Math.floor(Math.random() * 16777216)]]
        }));
    };
};
