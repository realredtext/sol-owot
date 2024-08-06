let renderCanvas = document.createElement("canvas");
let radiusParam = 5;
let radius = radiusParam*50;
let setting = "colormode";
let validSettings = ["colormode", "density"];
let doDisplay = true;
let doOffset = false;
let tileOffsets = {
	x: Math.floor(-positionX/tileW) * doOffset,
	y: Math.floor(-positionY/tileH) * doOffset
};

let emptyContent = blankTile().content.join("");
let emptyColor = blankTile().properties.color;

let ctx = renderCanvas.getContext('2d');
renderCanvas.style.border = "1px solid #000000";
renderCanvas.height = (2*radius)+"";
renderCanvas.width = (2*radius)+"";

let grd = ctx.createLinearGradient(0, 0, radius*2, 0);
grd.addColorStop(0, "green");
grd.addColorStop(1, "green");

ctx.fillStyle = grd;
ctx.fillRect(0, 0, radius*2, radius*2);

renderCanvas.style.position = "absolute";
renderCanvas.style.left = "20px";
renderCanvas.style.top = "20px";
document.getElementsByTagName("body")[0].appendChild(renderCanvas);

function canvasCoordsToTileCoords(cx, cy) {
	return {
		x: cx - radius,
		y: cy - radius
	};
};

function recalculateTileOffsets() {
	tileOffsets = {
		x: Math.floor(-positionX/tileW) * doOffset,
		y: Math.floor(-positionY/tileH) * doOffset
	};
}

function toCanvasCoord(x, y) {
	return [radius+x, radius+y];
};

function clickToPosition(cvas, event) {
	let rect = cvas.getBoundingClientRect();
	let scaleX = cvas.width / rect.width;
	let scaleY = cvas.height / rect.height;

	return {
		x: Math.round((event.clientX - rect.left) * scaleX),
		y: Math.round((event.clientY - rect.top) * scaleY)
	};
};

renderCanvas.onclick = function(x) {
	let processedCoords = clickToPosition(renderCanvas, x);
	let tileCoords = canvasCoordsToTileCoords(processedCoords.x, processedCoords.y);

	w.doGoToCoord((tileCoords.y + tileOffsets.y)/-4, (tileCoords.x + tileOffsets.x)/4);
}

function replaceAllIn(string, queries) {
    queries.forEach(query => {
        string = string.replaceAll(query, "");
    });

    return string;
}

const blankChars = [" ", "\u2800", "\u061c"];

let { ManagerCommandWrapper } = use("realredtext/scripts-owot/managers.js");

let rendererManager = new ManagerCommandWrapper("Large Renders", "#615747", {
	blocks: (x) => {
		if(typeof (x*1) !== "number" || Number.isNaN(x*1)) {
			return `Invalid input`
		}
		radiusParam = x*1;
		radius = radiusParam*50;
		renderCanvas.height = (2*radius)+"";
		renderCanvas.width = (2*radius)+"";
		let v = ctx.createLinearGradient(0, 0, radius*2, 0);
		v.addColorStop(0, "green");
		v.addColorStop(1, "green");
		ctx.fillStyle = v;
		ctx.fillRect(0, 0, radius*2, radius*2);
		return `Set radius to ${radius}`;
	},

	display: () => {
		let map = {
			"true": "",
			"false": "none"
		};
		doDisplay = !doDisplay;
		renderCanvas.style.display = map[doDisplay+""];
		return `Switched canvas display setting`
	},

	render: () => {
		update();
		rendererManager.core.send(`Estimated fetch time: ${(2*radiusParam ** 2)/20} seconds`);
		return `Fetching ${(2*radius)**2} tiles, ${radius/2} by ${radius/2} coords`;
	},
	setting: (nSetting) => {
		if(!nSetting) return `Current setting: ${setting}`;
		if(!validSettings.includes(nSetting)) return `Invalid setting, valid settings include ${validSettings.join(", ")}`;
		setting = nSetting;
		return `Switched rendering setting`;
	},
	offset: () => {
		doOffset = !doOffset;
		return `Set offset to ${doOffset}`;
	},
    ephemeral: () => {
        return `Ephemeral data: ${JSON.stringify(eph)}`;
    }
}, "renderer");

//===DO NOT EDIT THIS OBJECT===
let eph = {
	fetchBlocks: [],
	topCornerTC: [],
	imageData: [],
	firstBlock: {},
	secondBlock: {},
    arrayValues: [],
    fetchResponse: {}
}
//===DO NOT EDIT THIS OBJECT===
const resetEphemeral = function(key, value) {
	if(!(key in eph)) return;
	if(! ["{}", "[]"].includes(JSON.stringify(value))) return;

	delete eph[key];
	eph[key] = value;
}

function update() {
	let posX = Math.floor(-positionX/tileW) * doOffset;
	let posY = Math.floor(-positionY/tileH) * doOffset;

	tileOffsets.x = posX;
	tileOffsets.y = posY;

	for(var x = -radiusParam; x < 0; x++) {
		for(var y = -radiusParam; y < radiusParam; y++) {
			eph.fetchBlocks.push(JSON.stringify({
				fetchRectangles: [
				{
					minX: x*50 + posX,
					maxX: x*50 + 49 + posX,
					minY: y*50 + posY,
					maxY: y*50 + 49 + posY
				},

				{
					minX: (-x-1)*50 + posX,
					maxX: (-x-1)*50 + 49 + posX,
					minY: (-y-1)*50 + posY,
					maxY: (-y-1)*50 + 49 + posY,
				}
				],
				"kind": "fetch"
			}));
		};
	};

    for(var i in eph.fetchBlocks) {
        const msg = eph.fetchBlocks[i]; //TODO: make ephemeral without breaking everything
        setTimeout(function() {
            fetchSocket.send(msg);
        }, i+1 * 50);
    }
	setTimeout(()=>{
		rendererManager.core.send("All fetches sent, now waiting for response")
	}, eph.fetchBlocks.length * 50);
    resetEphemeral("fetchBlocks", []);
};

function handleReturnedTiles(tilesBack) {
	eph.topCornerTC = Object.keys(tilesBack)[0].split(",").map(Number).toReversed();
	eph.topCornerTC = [eph.topCornerTC[0] - tileOffsets.x, eph.topCornerTC[1] - tileOffsets.y];
	eph.imageData = ctx.createImageData(50, 50);
	for(var i in tilesBack) {
		let [ty, tx] = i.split(",").map(Number);
		[tx, ty] = toCanvasCoord(tx - tileOffsets.x, ty - tileOffsets.y);
		if(!tilesBack[i]) tilesBack[i] = blankTile();
		if(tilesBack[i].content instanceof Array) {
			tilesBack[i].content = tilesBack[i].content.join("");
		}
		handlePixel(tilesBack[i].content, tilesBack[i].properties.color || emptyColor, tx%50, ty%50, eph.imageData, setting);
	};
	ctx.putImageData(eph.imageData, ...toCanvasCoord(...eph.topCornerTC));
    resetEphemeral("imageData", []);
    resetEphemeral("topCornerTC", []);
};

let fetchSocket = new WebSocket(ws_path+"?hide=1");
fetchSocket.onmessage = (message) => {
	eph.fetchResponse = JSON.parse(message.data);
	if(eph.fetchResponse.kind !== "fetch") {
        resetEphemeral("fetchResponse", {});
        return;
    }
	let cnt = 0;
	for(var i in eph.fetchResponse.tiles) {
		if(cnt < 2500) {
			eph.firstBlock[i] = eph.fetchResponse.tiles[i];
		} else {
			eph.secondBlock[i] = eph.fetchResponse.tiles[i];
		}
		cnt++;
	};

	handleReturnedTiles(eph.firstBlock);
	handleReturnedTiles(eph.secondBlock);

	eph.firstBlock = {}; //do not refactor, breaks everything
	eph.secondBlock = {};
	resetEphemeral("fetchResponse", {});
};

fetchSocket.onopen = () => {
    fetchSocket.send(JSON.stringify({
        "kind": "config",
        "updates": false
    }));

    rendererManager.core.send("Opened fetching socket");
}

function arrayMode(arr,debug=false) {
		eph.arrayValues = [...new Set(arr)];
		let scores = {};
		for(var i of eph.arrayValues) {
			scores[i] = 0;
		};
        resetEphemeral("arrayValues", []);

		for(var i of arr) {
			scores[i]++;
		};

		let highest = Math.max(...Object.values(scores));
		let modeCandidates = [];
		for(var i in scores) {
			if(scores[i] === highest) modeCandidates.push(i);
		};
		if(debug) {
			return [scores, modeCandidates, highest];
		}
		if(modeCandidates.length === 1) {
			return modeCandidates[0];
		} else {
			return;
		};
	};

function handlePixel(tileContent, tileColors, x, y, imageData, setting) {
	switch(setting) {
		case "colormode":
			if(!replaceAllIn(tileContent, blankChars).length) {
				setPixel(imageData, x, y, 255, 255, 255, 255);
			} else {
				let colorMode = arrayMode(tileColors || emptyColor);
				if(!colorMode) colorMode = 0x000000;
				setPixel(imageData, x, y, ...int_to_rgb(colorMode), 255);
			}
			return;
		case "density":
			let usedContent = tileContent.replace(/ /g, "").length;
			let intensity = new Array(3).fill(Math.floor(255 * usedContent/128));
			setPixel(imageData, x, y, ...intensity, 255);
			return;
		default:
			return;
	}
};

function setPixel(imageData, x, y, r, g, b, a) {
    let index = (x + y * imageData.width) * 4;
    imageData.data[index + 0] = r;
    imageData.data[index + 1] = g;
    imageData.data[index + 2] = b;
    imageData.data[index + 3] = a;
};
