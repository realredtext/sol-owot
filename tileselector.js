function randInt(min, max) {
	return min + (Math.floor(Math.random()*(max-min)));
}

function replaceAllIn(string, queries) {
    queries.forEach(query => {
        string = string.replaceAll(query, "");
    });

    return string;
}

let decolorMode = false;
let blocksOnly = false;
let writeLimit = state.worldModel.char_rate[0];

const calculateClearTime = function(value, timeMS, tileContent) {
	if(tileContent instanceof Array) tileContent = tileContent.join("");
	tileContent = (tileContent.replace(/ /g, "").replaceAll("⠀", "").length)/128;

	value /= 128; //(working with whole tiles here)

	if(timeMS !== 1000) {
		value *= 1000/timeMS;
		timeMS *= 1000/timeMS;
	}

	if(state.userModel.is_member) return 1; // (members can send 128 spaces in 1 socket message)
	return Math.ceil((timeMS/value * tileContent));
}

let blankChars = [" ", "⠀", "؜"];
let userPerm = state.userModel.is_owner?2:(state.userModel.is_member?1:0);

function shouldClearChar(char, color, link, protection, mode) {
    if(protection > userPerm) return false;
    if(blankChars.includes(char) && !link) return false;
    if(mode.decolor) {
        if(mode.blocksonly) {
            return char === "█" && color;
        };

        return !!color;
    };

    if(mode.blocksonly) {
        return char === "█"
    }

    return true;
}

function shouldHandleTile(tile, mode) {
    let content = tile.content;
    let protection = tile.writability ?? 0;
    let colors = tile.properties.color || new Array(128).fill(0);

    if(protection > userPerm) return false;
    if(mode.blocksOnly && !content.filter(char => char === "█").length) return false;
    if(!content.filter(char => !blankChars.includes(char)).length) return false;
    if(mode.decolorMode && !colors.filter(x => x).length) return false;

    return true;
}

window.handleTile = function(tx, ty, mode) {
    let tileCoord = ty+","+tx;
    let tile = tiles[tileCoord];
    if(!tile) return;

    let tileContent = tile.content;
    let tileProtStats = {whole: tile.properties.writabiltiy, char: tile.properties.char ?? new Array(128).fill(null)}
    let links = tile.properties.cell_props ?? {};
    let tileColor = tile.properties.color ?? new Array(128).fill(0);

    let edits = [];
    if(!shouldHandleTile(tile, {decolorMode, blocksOnly})) return;
    for(var i = 0; i < 128; i++) {
        let y = Math.floor(i / 16);
        let x = i - y*16;
        let wChar = " ";
        let link;
        try {
            link = links[y][x]
        } catch(e) {};

        if(mode.decolorMode) wChar = tileContent[i];
        if(!shouldClearChar(tileContent[i], tileColor[i], link, tileProtStats.char[i], {decolor: decolorMode, blocksonly: blocksOnly})) continue;
        edits.push([ty, tx, y, x, randInt(1682530403503, Date.now()), wChar, 0, 0, 0]);
    };
    socket.send(JSON.stringify({
        kind: "write",
        edits: edits
    }));
};

function shouldAddTile(tile, mode) {
    let content = tile.content.join("");
    let color = tile.properties.color ?? new Array(128).fill(0);
    let links = tile.properties.cell_props;
    let prot = tile.properties.writability;

    if(!replaceAllIn(content, blankChars).length) return false;
    if(mode.blocksOnly) return content.includes("█");
    if(mode.decolorMode) return !!color.reduce((a,b) => a+b);

    return prot <= userPerm;
}

function clearTileRange(minX, minY, maxX, maxY) {
	let IntRange = (min, max) => {
		if(min > max) throw new RangeError("Minimum is greater than maximum!");

		let list = [];

		for(let i = min; i <= max; i++) {
			list.push(i);
		};

		return list;
	};

	const yValues = IntRange(minY, maxY).map(e => e*-1);
	const xValues = IntRange(minX, maxX);

	let clearingList = [[4.5682e20, -2.8432e20]];
	let intervalList = [0];
    let totalChars = 0;

	for(let i = minY; i <= maxY; i++) {
		for(let x = minX; x <= maxX; x++) {
			let tileCoord = i+","+x;
            let tile = tiles[tileCoord];
			if(!tile) continue;
            if(!shouldAddTile(tile, {decolorMode, blocksOnly})) continue;
			clearingList.push([x, i]);
			let tileClearTime = calculateClearTime(writeLimit, state.worldModel.char_rate[1], replaceAllIn(tile.content.join(""), blankChars));
			intervalList.push(tileClearTime + intervalList[intervalList.length - 1]);
            totalChars += tile.content.length;
		};
	};

	const totalTime = intervalList.at(-1);

	for(var i in clearingList) {
		let tile = clearingList[i];
		setTimeout(()=>{
			return handleTile(tile[0], tile[1], {decolorMode, blocksOnly});
		}, intervalList[i]);
	}

	clearerChatResponse(`Clearing ${clearingList.length - 1} tiles, ${totalChars} chars, expected time: ${totalTime/1000} seconds`);
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

function clearerChatResponse(msg) { //TODO: integrate Managers.js
	addChat(null, 0, "user", "[ Clearer ]", msg, "Clearer", ...[1,0,0], "#EE0000", getDate());
};
var clearrange_subcommands = {
	help: () => {
		clearerChatResponse("<ul><li><b>Commands</b></li><li>/clear spawn, for inside main spawn</li><li>/clear decolor, to eliminate color</li><li>/clear blocksonly, only removes █s</li></ul>");
	},
	decolor: () => {
		decolorMode = !decolorMode;
		clearerChatResponse(`Set decolor mode to ${decolorMode}`);
	},
	blocksonly: () => {
		blocksOnly = !blocksOnly;
		clearerChatResponse(`Set blocks only mode to ${blocksOnly}`);
	},
	writelimit: (x) => {
		if(x === "r") x = state.worldModel.char_rate[0];
		if(Number.isNaN(x*1)) return clearerChatResponse(`Invalid input`);
		x *= 1;
		writeLimit = x;
		clearerChatResponse(`Set write limit to ${x} chars/second`)
	}
};
client_commands.clear = ([subcommand, param]) => {
	if(!subcommand) {
		sel.startSelection();
	} else {
		if(subcommand in clearrange_subcommands) {
			clearrange_subcommands[subcommand](param);
		} else {
			clearerChatResponse("Invalid subcommand");
		};
	};
}

menu.addOption("Clear Range", () => {
    sel.startSelection()
});
