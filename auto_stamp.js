let decolorMode = false;
let blocksOnly = false;
let spawnMode = !state.worldModel.name;

const calculateTileInterval = function(limit=state.worldModel.char_rate) {
    let [value, timeMS] = limit;
    value /= 128; //(working with whole tiles here)

    if(timeMS !== 1000) {
        value *= 1000/timeMS;
        timeMS *= 1000/timeMS;
    }

    if(state.userModel.is_member) return 1; // (members can send 128 spaces in 1 socket message)
    if(spawnMode) return 1000/16;
    return Math.ceil((timeMS/value));
}

const wipeTile = function(tx, ty) {
    if(state.userModel.is_member) {
        socket.send(JSON.stringify({
            kind: "write",
            edits: [[ty, tx,0,0,getDate()," ".repeat(128),1,0]]
        }));
    } else {
        let tileCoord = ty+","+tx;
        if(!tiles[tileCoord]) return;
        let tileContent = tiles[tileCoord].content;
        let links = tiles[tileCoord].properties.cell_props || {};
        let edits = [];
        for(var x = 0; x < 16; x++) {
            for(var y = 0; y < 8; y++) {
                if(blocksOnly && tileContent[y*16 + x] !== "\u2588") continue;
                if(tileContent[y*16 + x] === " " && !(links[y+""])) continue;
                edits.push([ty, tx, y, x, Date.now(), " ", 0, 0]);
            };
        };
        socket.send(JSON.stringify({
            kind: "write",
            edits: edits
        }));
    }
};

const decolorTile = function(tx, ty) {
    let tileCoord = ty+","+tx;
    if(!tiles[tileCoord]) return;
    let tileColors = tiles[tileCoord].properties.color;
    let tileContent = tiles[tileCoord].content;
    let edits = [];
    if(!tileColors) return;
    if(!(tileColors.filter(x=>x).length)) return;
    for(var x = 0; x < 16; x++) {
        for(var y = 0; y < 8; y++) {
            if(tileColors[y*16 + x] === 0) continue;
            edits.push([ty, tx, y, x, Date.now(), tileContent[y*16 + x], 0, 0]);
        };
    };
     socket.send(JSON.stringify({
        kind: "write",
        edits: edits
    }));
}

function clearTileRange(minX, minY, maxX, maxY) {
    let IntRange = (min, max) => {
        if(min > max) throw new RangeError("Minimun is greater than maximum!");

        let list = [];

        for(let i = min; i <= max; i++) {
            list.push(i);
        };

        return list;
    };

    const yValues = IntRange(minY, maxY).map(e => e*-1);
    const xValues = IntRange(minX, maxX);

    let clearingList = [];

    let clearingInterval = calculateTileInterval();
    if(spawnMode) {
        clearingInterval = calculateTileInterval([2048, 1000]);
    }
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
        if(!decolorMode) {
            setTimeout(()=>{wipeTile(...tile)}, Math.ceil(i*clearingInterval));
        } else {
            setTimeout(()=>{decolorTile(...tile)}, Math.ceil(i*clearingInterval));
        }
    };
    clearingList = [];
    clearerChatResponse(`Started clearing<br>Clearing ${length} tiles<br>Estimated to end at: ${convertToDate(finishingTime)} (${(length*clearingInterval)/1000} seconds)`);
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
        clearerChatResponse("<ul><li><b>Commands</b></li><li>/clear spawn, for inside main spawn</li><li>/clear decolor, to eliminate color</li><li>/clear blocksonly, only removes █s</li></ul>");
    },
    spawn: () => {
        spawnMode = !spawnMode;
        clearerChatResponse(`Spawn mode set to ${spawnMode}`);
    },
    decolor: () => {
        decolorMode = !decolorMode;
        clearerChatResponse(`Set decolor mode to ${decolorMode}`);
    },
    blocksonly: () => {
        blocksOnly = !blocksOnly;
        clearerChatResponse(`Set blocks only mode to ${blocksOnly}`);
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
