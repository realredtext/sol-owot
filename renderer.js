let renderCanvas 			= document.createElement("canvas");
let radiusParam 			= 3;
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

let dispMap = {
	"true": "",
	"false": "none"
};

function filtArr(arr, filterFunction) { //function has params val and ind
    let pass = [];
    for(var i = 0; i < arr.length; i++) {
        if(filterFunction(arr[i], i)) pass.push(arr[i]);
    };

    arr = [];
    return pass;
};

function mapArr(arr, mapFunc) {
	for(var i = 0; i < arr.length; i++) {
		arr[i] = mapFunc(arr[i]);
	};
	
	return arr;
}

let ctx = renderCanvas.getContext('2d');
renderCanvas.style.border = "1px solid #000000";
renderCanvas.height = (2*radius)+"";
renderCanvas.width = (2*radius)+"";

ctx.fillStyle = "#008000";
ctx.fillRect(0, 0, radius*2, radius*2);

renderCanvas.style.position = "absolute";
renderCanvas.style.left = "20px";
renderCanvas.style.top = "20px";
renderCanvas.style["image-rendering"] = "pixelated";
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
};

function deRepetize(array) {
	let uniqueValues = [];
	for(var i of array) {
		if(!uniqueValues.includes(i)) uniqueValues.push(i);
	};

	return uniqueValues;
};

function hasLinks(tileProps) { //TODO: give better time complexity than n^2
	if(! "cell_props" in tileProps) return false;
	if(JSON.stringify(tileProps.cell_props) === "{}") return false;
	
	for(var i in tileProps.cell_props) { //cell_props can have empty row properties
		if(JSON.stringify(tileProps.cell_props[i]) === "{}") return false;
		for(var j in tileProps.cell_props[i]) {
			if(JSON.stringify(tileProps.cell_props[i][j]) === "{}") return false;
		};
	};
	
	return true;
	
}

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
	doDisplay = !doDisplay;
	renderCanvas.style.display = dispMap[doDisplay+""];
	return `Switched canvas display setting`;
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
	protData: {},
    char: [],
    protections: [],
    tx: 0,
    ty: 0,
    colorMode: 0,
    usedColors: []
}
//===DO NOT EDIT THIS OBJECT===
const resetEphemeral = function(key, value) {
	if(!(key in eph)) return;

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

    for(var i = 0; i < eph.fetchBlocks.length; i++) {
        let _copy = eph.fetchBlocks[i];
        setTimeout(function() {
            fetchSocket.send(_copy);
            _copy = ""; //basically ephemeral
        }, i+1 * 100);
    }
	setTimeout(()=>{
		rendererManager.core.send("All fetches sent, now waiting for response");
        resetEphemeral("fetchBlocks", []);
	}, eph.fetchBlocks.length * 100);
};

function handleReturnedTiles(tilesBack) {
	eph.topCornerTC = mapArr(Object.keys(tilesBack)[0].split(","), Number).toReversed();
	eph.topCornerTC = [eph.topCornerTC[0] - tileOffsets.x, eph.topCornerTC[1] - tileOffsets.y];
	eph.imageData = ctx.createImageData(50, 50);
	for(var i in tilesBack) { //TODO: for in loops on objects may be unoptimalT
		[eph.ty, eph.tx] = mapArr(i.split(","), Number);
		[eph.tx, eph.ty] = toCanvasCoord(eph.tx - tileOffsets.x, eph.ty - tileOffsets.y);
		if(!tilesBack[i]) tilesBack[i] = blankTile();
		if(tilesBack[i].content instanceof Array) {
			tilesBack[i].content = tilesBack[i].content.join("");
		}

		eph.protData = {
			writability: tilesBack[i].properties.writability ?? state.worldModel.writability,
			char: tilesBack[i].properties.char ?? new Array(128).fill(tilesBack[i].properties.writability ?? state.worldModel.writability)
		};
		
		let hasFilledCellProps = hasLinks(tilesBack[i].properties);

        eph.usedColors = tilesBack[i].properties.color ?? emptyColor;
        if(!eph.usedColors.length) eph.usedColors = emptyColor;

		handlePixel(tilesBack[i].content, eph.usedColors, {...eph.protData}, hasFilledCellProps, eph.tx%50, eph.ty%50, eph.imageData, setting);
	};
	ctx.putImageData(eph.imageData, ...toCanvasCoord(...eph.topCornerTC));
    resetEphemeral("imageData", []);
    resetEphemeral("topCornerTC", []);
	resetEphemeral("protData", {});
    tilesBack = {};
    resetEphemeral("usedColors", []);
    resetEphemeral("tx", 0);
    resetEphemeral("ty", 0);
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
	eph.char = data.char ?? new Array(128).fill(writability);

	eph.protections = new Array(128).fill(writability);
	for(var i = 0; i < eph.char.length; i++) {
		eph.protections[i] = eph.char[i];
	};

	let result = arrayMode(eph.protections);
    resetEphemeral("char", []);
    resetEphemeral("protections", []);
	return arrayMode(result);
};

function everyNth(array, n, offset=0) {
	return filtArr(array, function(val, ind) {
		return !((ind+offset)%n);
	})
}

function multiAverage(...codes) {
    for(var i = 0; i < codes.length; i++) {
        codes[i] = codes[i].replace(/\#/g, "");
        codes[i] = codes[i].match(/.{1,2}/g);
        codes[i] = [codes[i][0], codes[i][2], codes[i][1]];
    };
	
	let averageCode = [];
	for(var i = 0; i < 3; i++) {
		let valuesToAverage = everyNth(codes.flat(), 3, i);
		let average = mapArr(mapArr(valuesToAverage, function(code) {
			return code/255;
		}), function(code) {
			return code**2;
		}).reduce((a,b) => a+b)/valuesToAverage.length;

		let stringAverage = Math.floor(255*average**0.5);
		averageCode.push(stringAverage.toString(16).padStart(2,0));
	};

	return "#"+averageCode.join("");
}

function hexcode_to_int(hex) {
    return parseInt(hex.replace("#", ""), 16)
}

function handlePixel(tileContent, tileColors, protData, links, x, y, imageData, setting) {
    //TODO: this is called possibly millions of times, this cannot have ANY memory issues, must ephemeralize everything && optimize for CPU usage
	switch(setting) {
		case "colormode":
			if(!replaceAllIn(tileContent, blankChars).length) {
				setPixel(imageData, x, y, 255, 255, 255, 255);
			} else {
                tileColors = filtArr(tileColors, function(val, ind) {
					return !blankChars.includes(tileContent[ind]);
				});
				eph.colorMode = arrayMode(tileColors ?? emptyColor);
				if(!eph.colorMode) {
                    if(!tileColors.length) tileColors = emptyColor;
					eph.colorMode = hexcode_to_int(multiAverage(...(tileColors.map(color => int_to_hexcode(color ?? 0)))).replace("#", ""));
				}
				setPixel(imageData, x, y, ...int_to_rgb(eph.colorMode), 255);
			}
            resetEphemeral("colorMode", 0);
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
			tileContent = [];
			tileColors = [];
			protData = [];
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
