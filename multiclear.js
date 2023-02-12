let wipeTile = function(tx, ty, char=" ") {
        let tileCoord = ty+","+tx;
        if(!tiles[tileCoord]) return;
        let tileContent = tiles[tileCoord].content;
        let edits = [];
        for(var x = 0; x < 16; x++) {
            for(var y = 0; y < 8; y++) {
                if(tileContent[y*16 + x] === " ") continue;
                edits.push([ty, tx, y, x, Date.now(), char, 0, 0]);
            };
        };

        socket.send(JSON.stringify({
            kind: "write",
            edits: edits
        }));
    };
if(state.userModel.is_member) wipeTile = function(tx, ty, char=" ") {
    char = char[0];
    socket.send(JSON.stringify({
        kind: "write",
        edits: [[ty, tx,0,0,getDate(),char.repeat(128),1,0]]
    }));
};
var mltInfo = document.createElement("label");
mltInfo.style.display = "none";
mltInfo.innerText = "Multi-clear will clear a column of tiles one tile above and below the ones selected";
mltInfo.style.backgroundColor = "black";
mltInfo.style.color = "white";
mltInfo.style.position = "absolute";
mltInfo.style.left = "0px";
mltInfo.style.top = "0px";
document.body.appendChild(mltInfo);

var mltclrActivated = document.createElement("label");
mltclrActivated.innerText = " [ ACTIVE ]";
mltclrActivated.style.backgroundColor = "black";
mltclrActivated.style.color = "red";
mltclrActivated.style.fontWeight = "bold";
mltclrActivated.style.display = "none";
mltInfo.appendChild(mltclrActivated);

menu.addCheckboxOption("Multi Clear", function() {
	// activated
	mltInfo.style.display = "";
	mltclr.activated = true;
}, function() {
	// deactivated
	mltInfo.style.display = "none";
	mltclr.activated = false;
	tiles[currentPosition[1] + "," + currentPosition[0]].backgroundColor = "";
    tiles[currentPosition[1]+1+","+currentPosition[0]].backgroundColor = "";
    tiles[currentPosition[1]-1+","+currentPosition[0]].backgroundColor = "";
	w.setTileRedraw(currentPosition[0], currentPosition[1]);
    w.setTileRedraw(currentPosition[0], currentPosition[1]-1);
    w.setTileRedraw(currentPosition[0], currentPosition[1]+1);
});

var mltclr = {
	activated: false,
	lastPos: null,
	ctrlDown: false,
	color: "#00FF00",
	renderTile: function(preserveLastPos) {
		if(tiles[currentPosition[1] + "," + currentPosition[0]]&&
           tiles[currentPosition[1]+1+","+currentPosition[0]]&&
           tiles[currentPosition[1]-1+","+currentPosition[0]]) {
			// change color to red
			tiles[currentPosition[1] + "," + currentPosition[0]].backgroundColor = mltclr.color;
            tiles[currentPosition[1]+1+","+currentPosition[0]].backgroundColor = mltclr.color;
            tiles[currentPosition[1]-1+","+currentPosition[0]].backgroundColor = mltclr.color;
			if(!preserveLastPos)
				mltclr.lastPos = [currentPosition[0], currentPosition[1]];
			// re-render the tile
			w.setTileRender(currentPosition[0], currentPosition[1]);
            w.setTileRender(currentPosition[0], currentPosition[1]+1);
            w.setTileRender(currentPosition[0], currentPosition[1]-1)
		}
	},
	handleClear: wipeTile
};

// ctrl is pressed
function keydown_mltclr(e) {
	if(!mltclr.activated) return;
	if(mltclr.ctrlDown) return;
	if(e.ctrlKey) {
		mltclr.ctrlDown = true;
		mltclrActivated.style.display = "";
		mltclr.color = "#FF0000";
		mltclr.renderTile(true);
		mltclr.handleClear(currentPosition[0], currentPosition[1]);
        mltclr.handleClear(currentPosition[0], currentPosition[1]+1);
        mltclr.handleClear(currentPosition[0], currentPosition[1]-1)
	}
}
document.body.addEventListener("keydown", keydown_mltclr);

// mouse is moved
function mousemove_mltclr(e) {
	if(!mltclr.activated) return;
	if(mltclr.lastPos) {
		/*
			currentPosition is the built in way to get the current tile and char position from
			where your mouse cursor is.
			currentPosition = [tileX, tileY, charX, charY]
		*/
		// do no re-render if the cursor moved but is still inside the same tile
		if(mltclr.lastPos[0] == currentPosition[0] && mltclr.lastPos[1] == currentPosition[1]) {
			return;
		}
		var tileBackColorRes = tiles[mltclr.lastPos[1] + "," + mltclr.lastPos[0]];
		if(tileBackColorRes) {
            tileBackColorRes.backgroundColor = "";
            tiles[mltclr.lastPos[1]+1+","+mltclr.lastPos[0]].backgroundColor = "";
            tiles[mltclr.lastPos[1]-1+","+mltclr.lastPos[0]].backgroundColor = ""
        };
		// re-render the tile
		w.setTileRender(mltclr.lastPos[0], mltclr.lastPos[1]);
        w.setTileRender(mltclr.lastPos[0], mltclr.lastPos[1]+1);
        w.setTileRender(mltclr.lastPos[0], mltclr.lastPos[1]-1)
	}
	// if tile exists
	mltclr.renderTile();
	if(mltclr.ctrlDown) {
		mltclr.handleClear(currentPosition[0], currentPosition[1]);
        mltclr.handleClear(currentPosition[0], currentPosition[1]+1);
        mltclr.handleClear(currentPosition[0], currentPosition[1]-1);
	}
}
document.body.addEventListener("mousemove", mousemove_mltclr);

// a key is released
function keyup_mltclr(e) {
	if(!mltclr.activated) return;
	mltclr.ctrlDown = false;
	mltclrActivated.style.display = "none";
	mltclr.color = "#00FF00";
	// remove color of tile
	if(mltclr.lastPos) {
		tiles[mltclr.lastPos[1] + "," + mltclr.lastPos[0]].backgroundColor = "";
        tiles[mltclr.lastPos[1]+1+","+mltclr.lastPos[0]].backgroundColor = "";
        tiles[mltclr.lastPos[1]-1+","+mltclr.lastPos[0]].backgroundColor = "";
		// re-render the tile
		w.setTileRender(mltclr.lastPos[0], mltclr.lastPos[1]);
        w.setTileRender(mltclr.lastPos[0], mltclr.lastPos[1]+1);
        w.setTileRender(mltclr.lastPos[0], mltclr.lastPos[1]-1)
	}
	tiles[currentPosition[1] + "," + currentPosition[0]].backgroundColor = "";
	w.setTileRender(currentPosition[0], currentPosition[1]);
    w.setTileRender(currentPosition[0], currentPosition[1]+1);
    w.setTileRender(currentPosition[0], currentPosition[1]-1);
	mltclr.lastPos = null;
}
document.body.addEventListener("keyup", keyup_mltclr);
