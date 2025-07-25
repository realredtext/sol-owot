let limitFactor = 5;
let clearWrites = [];
let settings = {
	decolor: false,
	linksonly: false
};
let only = [];
let not = [];
let tileCache = {};

const userPerm = state.userModel.is_owner?2:(state.userModel.is_member?1:0);
const blankChars = [" ", "⠀", "؜"];
const blankProps = {
	color: new Array(tileArea).fill(0),
	bgcolor: new Array(tileArea).fill(-1),
	protection: (writability) => {
		return new Array(tileArea).fill(writability ?? state.worldModel.writability);
	}
}

function timeToSendEdits(charsPer, interval) {
    let fixed = {
        interval: interval * 1000/interval,
        chars: charsPer * 1000/interval
    };

    return fixed.interval * (512 / fixed.chars);
};

function fixedModulo(x, y) {
    if(x > -1) return x % y;
	if(Math.floor(+x / y) === +x / y) return 0; //99.999% analytical grade jank
    return y + x % y;
};

function deRepetize(array) {
	let uniqueValues = [];
	for(var i of array) {
		if(!uniqueValues.includes(i)) uniqueValues.push(i);
	};

	return uniqueValues;
};

function hasLink(cell_props, x, y) {
	return cell_props && y in cell_props && x in cell_props[y];
};

//DO NOT EDIT THIS OBJECT OR ITS PROPERTIES
let eph = {
	relativeX: 0,
	relativeY: 0,
	absoluteX: 0,
	absoluteY: 0,
	ftx: 0,
	fty: 0,
	fcx: 0,
	fcy: 0,
	focusTile: {},
	focusProps: {},
	charData: {},
	name: ""
};

const setEph = function(k, v) {
	if(!k in eph) return;
	delete eph[k];
	eph[k] = v;
}

function shouldClearChar(char, hasLink, hasBG, protection, hasColor, decolor, linksonly) {
	if(protection > userPerm) return false;
	if(not.length) return !not.includes(char);
	if(only.length) return only.includes(char);
	if(linksonly) return hasLink;
	if(decolor) return hasBG || hasColor;

	return !blankChars.includes(char) || (hasLink || hasBG);
};

let cSel = new RegionSelection();
cSel.charColor = "#ff0000";
cSel.color = "rgba(127, 127, 127, 0.1)";
cSel.init();
cSel.onselection(function(coorda, coordb, width, height) {
	let abso = {
		x: coorda[2] + coorda[0]*tileC,
		y: coorda[3] + coorda[1]*tileR
	};
	let clearCount = 0;
	for(var i = 0; i < width*height; i++) {
		eph.relativeX = i % width;
		eph.relativeY = Math.floor(i / width);
		eph.absoluteX = abso.x + eph.relativeX;
		eph.absoluteY = abso.y + eph.relativeY;

		eph.ftx = Math.floor(eph.absoluteX / tileC);
		eph.fty = Math.floor(eph.absoluteY / tileR);
		eph.fcx = fixedModulo(eph.absoluteX, tileC);
		eph.fcy = fixedModulo(eph.absoluteY, tileR);

		eph.name = eph.fty+","+eph.ftx;


		//TODO: this looks up all tiles very quickly, however their content can change (clearing itself is done over a much longer timespan), must put lookup into interval somehow
		eph.focusTile = tileCache[eph.name] ?? tiles[eph.name];
		if(!tileCache[eph.name]) {
			tileCache[eph.name] = tiles[eph.name];
		};

		eph.focusProps = eph.focusTile.properties;
		let index = eph.fcy*tileC + eph.fcx;
		if(!eph.focusTile) continue;

		eph.charData = {
			char: eph.focusTile.content[index],
			link: hasLink(eph.focusProps.cell_props ?? {}, eph.fcx, eph.fcy),
			bgcolor: (eph.focusProps.bgcolor ?? blankProps.bgcolor)[index] !== -1,
			protection: (eph.focusProps.char ?? blankProps.protection(eph.focusTile.properties.writability))[index],
			hasColor: !!(eph.focusProps.color ?? blankProps.color)[index],
            decolor: settings.decolor,
            linksonly: settings.linksonly
		};

		let charToWrite = " ";
		if(settings.decolor || settings.linksonly) {
            console.log("WORK YOU CUNT");
            charToWrite = eph.focusTile.content[index];
        }

		let colorToWrite = 0;
		if(settings.linksonly) colorToWrite = (eph.focusTile.properties.color ?? blankProps.color)[index];

        let bgColorToWrite = -1;
        if(settings.linksonly) bgColorToWrite = (eph.focusTile.properties.bgcolor ?? blankProps.bgcolor)[index];

		if(!shouldClearChar(...Object.values(eph.charData))) continue;
		clearWrites.push([eph.fty, eph.ftx, eph.fcy, eph.fcx, 0, charToWrite, Math.floor(Math.random()*1e6), colorToWrite, bgColorToWrite]);
		clearCount++;
	};

	clearManager.core.send(`Clearing ${clearCount} chars, estimated time: ${clearCount/state.worldModel.char_rate[0]} second(s)`);

	setEph("relativeX", 0);
	setEph("relativeY", 0);
	setEph("absoluteX", 0);
	setEph("absoluteY", 0);

	setEph("ftx", 0);
	setEph("fty", 0);
	setEph("fcx", 0);
	setEph("fcy", 0);

	setEph("focusTile", {});
	setEph("focusProps", {});
	setEph("charData", {});
	setEph("name", "");

	tileCache = {};
});

let { ManagerCommandWrapper } = use("realredtext/scripts-owot/managers.js");

let clearManager = new ManagerCommandWrapper("Clearer", "#FF0000", {
	"default": () => {
		cSel.startSelection();
		return `Select area to clear`;
	},
	"limit": (x) => {
		if(!x) return `Current limit factor: ${limitFactor}`;
		if(Number.isNaN(x)) return `Invalid input`;
		let num = Number(x);
		if(num < 1) return `Invalid input`;
		if(num > 7) return `High limits will severely impact clearing speed`;

		limitFactor = num;
		return `Set limit factor to ${num}`;
	},
	"set": (setting) => {
		if(!Object.keys(settings).includes(setting)) return `Invalid setting`;

		if(setting !== "linksonly") settings.linksonly = false;
		if(setting === "linksonly" && !settings.linksonly) settings.decolor = false;

		settings[setting] = !settings[setting];
		return `Set ${setting} to ${settings[setting]}`;
	},
	"settings": () => {
		return JSON.stringify(settings); //TODO: add better display, more settings?
	},
	"only": (badChars) => {
		if(!badChars) {
			only = [];
			return `Set filter to none`;
		};
		only = deRepetize(badChars.split(""));

		return `Set filter to characters ${only.join("")}`
	},
	"not": (goodChars) => {
		if(!goodChars) {
			not = blankChars;
			return `Set avoided chars to none`;
		};
		not = [...deRepetize(goodChars.split("")), ...blankChars];

		return `Set avoided chars to ${not.join("")}`;
	},
    "flush": () => {
        clearWrites = [];
        return `Flushed all current queued writes`;
    }
}, "clearer")

let sendWritesInterval = setInterval(() => {
	if(!clearWrites.length) return;
	network.write(clearWrites.splice(0,512), {
		preserve_links: !settings.linksonly
	});
}, timeToSendEdits(...state.worldModel.char_rate) * (1 + limitFactor / 10));

menu.addOption("Clear area", () => {
	cSel.startSelection();
});
