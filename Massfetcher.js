setInterval(() => {
    let base = Math.floor(Math.random() * 10000);

    socket.send(JSON.stringify({
        kind: "fetch",
        fetchRectanges: {
            maxX: base + 5,
            maxY: base + 5,
            minX: base - 5,
            minY: base - 5,
        }
    }))
}, 10);
