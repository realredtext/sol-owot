var slowMode = false;

function clearTileRange(minX, minY, maxX, maxY) {
    let IntRange = (min, max) => {
        if(min > max) throw new RangeError("Minimun is greater than maximum!");

        let list = [];

        for(let i = min; i <= max; i++) {
            list.push(i);
        };

        return list;
    };

    window.wipeTile = function(tx, ty, char=" ") {
        let tileCoord = ty+","+tx;
        if(!tiles[tileCoord]) return;
        let tileContent = tiles[tileCoord].content;
        let links = tiles[tileCoord].properties.cell_props || {};
        let edits = [];
        for(var x = 0; x < 16; x++) {
            for(var y = 0; y < 8; y++) {
                if(tileContent[y*16 + x] === " " && !(links[y+""])) continue;
                edits.push([ty, tx, y, x, Date.now(), char, 0, 0]);
            };
        };
        
        socket.send(JSON.stringify({
            kind: "write",
            edits: edits
        }));
    };
    if(state.userModel.is_member) window.wipeTile = function(tx, ty, char=" ") {
        char = char[0];
        socket.send(JSON.stringify({
            kind: "write",
            edits: [[ty, tx,0,0,getDate(),char.repeat(128),1,0]]
        }));
    };

    const yValues = IntRange(minY, maxY).map(e => e*-1);
    const xValues = IntRange(minX, maxX);

    let clearingList = [];

    let clearingInterval = (slowMode&&state.worldModel.name==="")?270:7;
    if(state.userModel.is_member) clearingInterval = 1;

    for(let i = minY; i <= maxY; i++) {
        for(let x = minX; x <= maxX; x++) {
            let tileCoord = i+","+x;
            if(!tiles[tileCoord] || tiles[tileCoord].content.join("") === " ".repeat(128)) continue;
            clearingList.push([x, i]);
        };
    };

    let length = clearingList.length;
    let finishingTime = Date.now()+(length * clearingInterval);

    for(var i = 0; i < clearingList.length; i++) {
        let tile = clearingList[i];
        setTimeout(()=>{wipeTile(...tile)}, i*clearingInterval);
    };
    clearingList = [];
    clearerChatResponse(`Started clearing<br>Clearing ${length} tiles<br>Estimated to end at: ${convertToDate(finishingTime)}`);
};

var sel = new RegionSelection();
sel.charColor = "#ff0000";
sel.color = "rgba(123, 123, 123, 0.1)";
sel.tiled = true;
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
        clearerChatResponse("<ul><li>• Do not use outside of spawn on fast mode due to lower rate limit</li><li>• Very large selected areas will not be fully cleared, use multiple times</li></ul>");
    },
    slow: () => {
        slowMode = !slowMode;
        clearerChatResponse(`Slow mode set to ${slowMode}`);
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
