function wipeTile(tx, ty, char=" ") {
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
var atcInfo = document.createElement("label");
atcInfo.style.display = "none";
atcInfo.innerText = "Press CTRL and move your mouse around to clear tiles. "+"This will clear all tiles where the mouse cursor is located.";
atcInfo.style.backgroundColor = "black";
atcInfo.style.color = "white";
atcInfo.style.position = "absolute";
atcInfo.style.left = "0px";
atcInfo.style.top = "0px";
document.body.appendChild(atcInfo);

var admclrActivated = document.createElement("label");
admclrActivated.innerText = " [ ACTIVE ]";
admclrActivated.style.backgroundColor = "black";
admclrActivated.style.color = "red";
admclrActivated.style.fontWeight = "bold";
admclrActivated.style.display = "none";
atcInfo.appendChild(admclrActivated);

menu.addCheckboxOption("Clear Tiles", function() {
	// activated
	atcInfo.style.display = "";
	admclr.activated = true;
}, function() {
	// deactivated
	atcInfo.style.display = "none";
	admclr.activated = false;
	tiles[currentPosition[1] + "," + currentPosition[0]].backgroundColor = "";
	w.setTileRedraw(currentPosition[0], currentPosition[1]);
});

var admclr = {
	activated: false,
	lastPos: null,
	ctrlDown: false,
	color: "#00FF00",
	renderTile: function(preserveLastPos) {
		if(tiles[currentPosition[1] + "," + currentPosition[0]]) {
			// change color to red
			tiles[currentPosition[1] + "," + currentPosition[0]].backgroundColor = admclr.color;
			if(!preserveLastPos)
				admclr.lastPos = [currentPosition[0], currentPosition[1]];
			// re-render the tile
			w.setTileRender(currentPosition[0], currentPosition[1]);
		}
	},
	handleClear: wipeTile
};

// ctrl is pressed
function keydown_admclr(e) {
	if(!admclr.activated) return;
	if(admclr.ctrlDown) return;
	if(e.ctrlKey) {
		admclr.ctrlDown = true;
		admclrActivated.style.display = "";
		admclr.color = "#FF0000";
		admclr.renderTile(true);
		admclr.handleClear(currentPosition[0], currentPosition[1]);
	}
}
document.body.addEventListener("keydown", keydown_admclr);

// mouse is moved
function mousemove_admclr(e) {
	if(!admclr.activated) return;
	if(admclr.lastPos) {
		/*
			currentPosition is the built in way to get the current tile and char position from
			where your mouse cursor is.
			currentPosition = [tileX, tileY, charX, charY]
		*/
		// do no re-render if the cursor moved but is still inside the same tile
		if(admclr.lastPos[0] == currentPosition[0] && admclr.lastPos[1] == currentPosition[1]) {
			return;
		}
		var tileBackColorRes = tiles[admclr.lastPos[1] + "," + admclr.lastPos[0]];
		if(tileBackColorRes) tileBackColorRes.backgroundColor = "";
		// re-render the tile
		w.setTileRender(admclr.lastPos[0], admclr.lastPos[1]);
	}
	// if tile exists
	admclr.renderTile();
	if(admclr.ctrlDown) {
		admclr.handleClear(currentPosition[0], currentPosition[1]);
	}
}
document.body.addEventListener("mousemove", mousemove_admclr);

// a key is released
function keyup_admclr(e) {
	if(!admclr.activated) return;
	admclr.ctrlDown = false;
	admclrActivated.style.display = "none";
	admclr.color = "#00FF00";
	// remove color of tile
	if(admclr.lastPos) {
		tiles[admclr.lastPos[1] + "," + admclr.lastPos[0]].backgroundColor = "";
		// re-render the tile
		w.setTileRender(admclr.lastPos[0], admclr.lastPos[1]);
	}
	tiles[currentPosition[1] + "," + currentPosition[0]].backgroundColor = "";
	w.setTileRender(currentPosition[0], currentPosition[1]);
	admclr.lastPos = null;
}
document.body.addEventListener("keyup", keyup_admclr);
