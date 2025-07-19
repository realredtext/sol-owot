let renderCanvas 			= document.createElement("canvas");
let radiusParam 			= 5;
let radius 					= radiusParam*50;
let setting 				= "colormode";
let validSettings 			= ["colormode", "density", "protections", "links", "searchall", "searchany"];
let doDisplay 				= true;
let doOffset 				= false;
let emptyContent 			= blankTile().content.join("");
let emptyColor 				= blankTile().properties.color;
let searchChars				= [];

let tileOffsets = {
	x: Math.floor(-positionX/tileW) * doOffset,
	y: Math.floor(-positionY/tileH) * doOffset
};

let ctx = renderCanvas.getContext('2d');
renderCanvas.style.border = "1px solid #000000";
renderCanvas.height = (2*radius)+"";
renderCanvas.width = (2*radius)+"";

ctx.fillStyle = "#008000";
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
};

function includesAnyOf(queries, sample) {
	for(var i of queries) {
		if(sample.includes(i)) {
			return true;
		}
	}
	return false;
};

function includesAllOf(queries, sample) {
	for(var i of queries) {
		if(!sample.includes(i)) {
			return false;
		};
	};

	return true;
}

function deRepetize(array) {
	let uniqueValues = [];
	for(var i of array) {
		if(!uniqueValues.includes(i)) uniqueValues.push(i);
	};

	return uniqueValues;
};

const blankChars = [" ", "\u2800", "\u061c"];

let { ManagerCommandWrapper } = use("realredtext/scripts-owot/managers.js");

let rendererManager = new ManagerCommandWrapper("Image Renderer", "#005500", {
	blocks: (x) => {
		if(typeof (x*1) !== "number" || Number.isNaN(x*1)) {
			return `Invalid input`
		}
        if(x*1 < 1 || x*1 % 1) {
            return `Invalid input`
        }
		radiusParam = x*1;
		radius = radiusParam*50;
		renderCanvas.height = (2*radius)+"";
		renderCanvas.width = (2*radius)+"";

		ctx.fillStyle = "#008000";
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
		if(setting === "searchchars" && !searchChars.length) {
			return `Invalid search characters`;
		}

		ctx.fillStyle = "#008000";
		ctx.fillRect(0, 0, radius*2, radius*2);

		update();
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
    },
	settings: () => {
		return `All settings: ${validSettings.join(", ")}`;
	},
	searchchars: (chars) => {
		if(!chars) {
			searchChars = [];
			return `Reset search characters`;
		};

		searchChars = deRepetize(chars.split(""));
		return `Set search chars to ${searchChars.join("")}`;
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
    fetchResponse: {},
	protData: {}
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
        }, i+1 * 70);
    }
	setTimeout(()=>{
		rendererManager.core.send("All fetches sent, now waiting for response")
	}, eph.fetchBlocks.length * 70);
    resetEphemeral("fetchBlocks", []);
};

function hasLinks(tile) {
	return  "cell_props" in tile.properties && JSON.stringify(tile.properties?.cell_props) !== "{}";
}

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

		eph.protData = {
			writability: tilesBack[i].properties.writability ?? state.worldModel.writability,
			char: tilesBack[i].properties.char ?? new Array(128).fill(tilesBack[i].properties.writability ?? state.worldModel.writability)
		};

		let hasFilledCellProps = "cell_props" in tilesBack[i].properties && JSON.stringify(tilesBack[i].properties?.cell_props) !== "{}";

        let usedColors = tilesBack[i].properties.color ?? emptyColor;
        if(!usedColors.length) usedColors = emptyColor;

		handlePixel(tilesBack[i].content, usedColors, {...eph.protData}, hasLinks(tilesBack[i]), tx%50, ty%50, eph.imageData, setting);
	};
	ctx.putImageData(eph.imageData, ...toCanvasCoord(...eph.topCornerTC));
    resetEphemeral("imageData", []);
    resetEphemeral("topCornerTC", []);
	resetEphemeral("protData", {});
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

	handleReturnedTiles({...eph.firstBlock});
	handleReturnedTiles({...eph.secondBlock});

	resetEphemeral("firstBlock", {});
	resetEphemeral("secondBlock", {});
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

const protectionColors = {
	"0": [0xff, 0xff, 0xff],
	"1": [0, 0, 0xff],
	"2": [0xff, 0, 0],
	"X": [0xff, 0, 0xff]
};

function modeOfProtections(data) {
	let writability = data.writability ?? state.worldModel.writability;
	let char = data.char ?? new Array(128).fill(writability);

	let protections = new Array(128).fill(writability);
	for(var i = 0; i < char.length; i++) {
		protections[i] = char[i];
	};

	let mostCommonProtection = arrayMode(protections);
	return mostCommonProtection;
};

function everyNth(array, n, offset=0) {
	return array.filter((value, index) => !((index+offset)%n));
}

function multiAverage(...codes) {
	codes = codes.map(code => code.replace(/\#/g, ""))
		.map(code => code.match(/.{1,2}/g))
		.map(code => code.map(scode => parseInt(scode, 16)))
		.map(code => [code[0], code[2], code[1]]); //for some reason, everyNth is broken

	let averageCode = [];
	for(var i = 0; i < 3; i++) {
		let valuesToAverage = everyNth(codes.flat(), 3, i);
		let average = valuesToAverage.map(code => code / 255)
		.map(code => code**2)
		.reduce((a,b) => a+b)/valuesToAverage.length;

		let stringAverage = Math.floor(255*average**0.5);
		averageCode.push(stringAverage.toString(16).padStart(2,0));
	};

	return "#"+averageCode.join("");
}

function hexcode_to_int(hex) {
    return parseInt(hex.replace("#", ""), 16)
}

function handlePixel(tileContent, tileColors, protData, links, x, y, imageData, setting) { //TODO: this is called possibly millions of times, this cannot have ANY memory issues, must ephemeralize everything
	switch(setting) {
		case "colormode":
			if(!replaceAllIn(tileContent, blankChars).length) {
				setPixel(imageData, x, y, 255, 255, 255, 255);
			} else {
                tileColors = tileColors.filter((color, index) => !blankChars.includes(tileContent[index]));
				let colorMode = arrayMode(tileColors ?? emptyColor);
				if(!colorMode) {
                    if(!tileColors.length) tileColors = emptyColor;
					colorMode = hexcode_to_int(multiAverage(...(tileColors.map(color => int_to_hexcode(color ?? 0)))).replace("#", ""));
				}
				setPixel(imageData, x, y, ...int_to_rgb(colorMode), 255);
			}
			return;
		case "density":
			let usedContent = replaceAllIn(tileContent, blankChars).length;
			let intensity = new Array(3).fill(Math.floor(255 * usedContent/128));
			setPixel(imageData, x, y, ...intensity, 255);
			return;
		case "protections":
			let mostCommonProtection = modeOfProtections(protData); //TODO: the center console is not shown as member protected despite having 71/128 non-public chars per tile

			setPixel(imageData, x, y, ...protectionColors[mostCommonProtection], 255);
			return;
		case "links":
			setPixel(imageData, x, y, 255, links?0:255, links?0:255, 255);
			return;
		case "searchany":
			let hasSearchChars = includesAnyOf(searchChars, tileContent);
			setPixel(imageData, x, y, 255, hasSearchChars?0:255, hasSearchChars?0:255, 255);
			return;
		case "searchall":
			let hasAllChars = includesAllOf(searchChars, tileContent);
			setPixel(imageData, x, y, 255, hasAllChars?0:255, hasAllChars?0:255, 255);
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
