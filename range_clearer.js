function clearTileRange(minX, minY, maxX, maxY) {
    let IntRange = (min, max) => {
        if(min > max) throw new RangeError("Minimun is greater than maximum!");
    
        let list = [];
    
        for(let i = min; i <= max; i++) {
            list.push(i);
        };
    
        return list;
    };

    let wipeTile = (tx, ty, char=" ") => {
        for(let x = 0; x < 16; x++) {
            socket.send(JSON.stringify({
                kind: "write",
                edits: [
                    [ty, tx, 0, x, getDate(), char, nextObjId++, 0],
                    [ty, tx, 1, x, getDate(), char, nextObjId++, 0],
                    [ty, tx, 2, x, getDate(), char, nextObjId++, 0],
                    [ty, tx, 3, x, getDate(), char, nextObjId++, 0],
                    [ty, tx, 4, x, getDate(), char, nextObjId++, 0],
                    [ty, tx, 5, x, getDate(), char, nextObjId++, 0],
                    [ty, tx, 6, x, getDate(), char, nextObjId++, 0],
                    [ty, tx, 7, x, getDate(), char, nextObjId++, 0]
                ]
            }));
        };
    };

    const yValues = IntRange(minY, maxY).map(e => e*-1);
    const xValues = IntRange(minX, maxX);
    

    for(let i = minY; i <= maxY; i++) {
        for(let x = minX; x <= maxX; x++) {
            wipeTile(x, i);
        };
    };
};
var sel = new RegionSelection();
sel.charColor = "#ff0000";
sel.color = "rgba(123, 123, 123, 0.1)";
sel.init();
sel.onselection(function(coordA, coordB, regWidth, regHeight) {
    var minTileX = coordA[0];
    var minTileY = coordA[1];
    var maxTileX = coordB[0];
    var maxTileY = coordB[1];
    clearTileRange(minTileX, minTileY, maxTileX, maxTileY);
});

function clearerChatResponse(msg) {
    addChat(null, 0, "user", "[ Clearer ]", msg, "Clearer", ...[1,0,0], "#EE0000", getDate());
};
var clearrange_subcommands = {
    help: () => {
        clearerChatResponse("<ul><li>• Do not use outside of spawn due to lower rate limit</li><li>• Large selected areas will not be fully cleared, use multiple times</li><li>• Selecting one character of a tile will clear that tile</li></ul>");
    }
};
client_commands.clear = ([subcommand]) => {
    if(!subcommand) {
        sel.startSelection();
        clearerChatResponse("Select tiles to be cleared");
    } else {
        if(subcommand in clearrange_subcommands) {
            clearrange_subcommands[subcommand]();
        } else {
            clearerChatResponse("Invalid subcommand");
        };
    };
    
};
