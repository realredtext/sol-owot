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
        if(tiles[ty+","+tx].content.join("") === " ".repeat(128)) return;
        let edits = [];
        for(let x = 0; x < 16; x++) {
            edits.push(
                [ty, tx, 0, x, Date.now(), char, 0, 0],
                [ty, tx, 1, x, Date.now(), char, 0, 0],
                [ty, tx, 2, x, Date.now(), char, 0, 0],
                [ty, tx, 3, x, Date.now(), char, 0, 0],
                [ty, tx, 4, x, Date.now(), char, 0, 0],
                [ty, tx, 5, x, Date.now(), char, 0, 0],
                [ty, tx, 6, x, Date.now(), char, 0, 0],
                [ty, tx, 7, x, Date.now(), char, 0, 0]
            )
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


    for(let i = minY; i <= maxY; i++) {
        for(let x = minX; x <= maxX; x++) {
            clearingList.push([x, i]);
        };
    };
    for(var i = 0; i < clearingList.length; i++) {
        let tile = clearingList[i];
        setTimeout(()=>{wipeTile(...tile)}, i*(slowMode?777:7));
    };
    clearingList = [];
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
