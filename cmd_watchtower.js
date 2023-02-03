network.cmd_opt();

let atlas = {};

let users = {};

function atlasPush(channel, username, override=false) {
    if((channel in atlas) && !override) return;
    
    atlas[channel] = username;
};

function usersPush(username, channel) {
    if(!(username in users)) return;
    
    users[username] = channel;
};

w.on("cmd", (e) => {
    if(!e.username) return;

    atlasPush(e.sender, e.username);

    if(
        e.username in users && !(e.sender in atlas)
    ) atlasPush(e.sender, e.username, true); //updates atlas when user refreshes 
});

w.on("tileUpdate", (e) => {
    let updatedTiles = e.tiles;
    let sender = e.channel;
    if(!(sender in atlas)) return;

    for(var i in updatedTiles) {
        let coord = i.split(",").reverse().map(e => Math.floor(e/4));
        coord[1] *= -1;

        console.log(`Update at ${coord.join(", ")} by ${atlas[sender]}`);
    };
});
