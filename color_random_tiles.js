function colorRandomTiles(range=10) {
    function rangedRandom(min, max) {
        return min + Math.round(Math.random() * (max - min));
    };
    setInterval(() => {
        let [tileY, tileX] = [rangedRandom(-range, range), rangedRandom(-range, range)];
        let randomColor = Math.floor(Math.random() * 16777216);
        
        let edits = [];
        for(let x = 0; x < 16; x++) {
            edits.push([tileY, tileX, 0, x, getDate, "█", 0, randomColor]);
            edits.push([tileY, tileX, 1, x, getDate, "█", 0, randomColor]);
            edits.push([tileY, tileX, 2, x, getDate, "█", 0, randomColor]);
            edits.push([tileY, tileX, 3, x, getDate, "█", 0, randomColor]);
            edits.push([tileY, tileX, 4, x, getDate, "█", 0, randomColor]);
            edits.push([tileY, tileX, 5, x, getDate, "█", 0, randomColor]);
            edits.push([tileY, tileX, 6, x, getDate, "█", 0, randomColor]);
            edits.push([tileY, tileX, 7, x, getDate, "█", 0, randomColor]);
        };
        
        socket.send(JSON.stringify({
            kind: "write",
            edits: [
                [tileY, tileX, 0, charX, getDate(), "█", 10, randomColor],
                [tileY, tileX, 1, charX, getDate(), "█", 10, randomColor],
                [tileY, tileX, 2, charX, getDate(), "█", 10, randomColor],
                [tileY, tileX, 3, charX, getDate(), "█", 10, randomColor],
                [tileY, tileX, 4, charX, getDate(), "█", 10, randomColor],
                [tileY, tileX, 5, charX, getDate(), "█", 10, randomColor],
                [tileY, tileX, 6, charX, getDate(), "█", 10, randomColor],
                [tileY, tileX, 7, charX, getDate(), "█", 10, randomColor]
            ]
        }));
    });
}
