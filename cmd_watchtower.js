let atlas = {};

function addUser(channel, username) {
    atlas[channel] = {username: username, lastPos: []};
};

function changeLastPos(channel, value) {
    if(channel in atlas) atlas[channel].lastPos = value;
};

network.cmd_opt();
w.on("cmd", (e) => {
    if(!(e.sender in atlas)) {
        addUser(e.sender, e.username || "anon");
        console.log(`New addition to atlas: [${e.sender}: ${e.username||"anon"}]`)
    }
});

w.socket.onmessage = new Proxy(w.socket.onmessage, {
    apply: function(func, _, args) {
        var data = JSON.parse(args[0].data);
        if (data.kind == "tileUpdate") {
            const sender = data.channel;
            for (const i in data.tiles) {
                var nums = i.split(",").map(x => parseInt(x));
                var positionX = Math.floor(nums[1] / coordSizeX);
                var positionY = Math.floor(-nums[0] / coordSizeY);
                var editTime = new Date(Date.now()).toString().slice(0, 24);
                let nameToUse = (sender in atlas)?atlas[sender].username:"unknown";
                var output = `tileUpdate at ${positionX}, ${positionY} on ${editTime}, by ${nameToUse}`;
                console.log(output);
                changeLastPos(sender, [positionX, positionY])
            }
        }

        func(...args);
    }
});
