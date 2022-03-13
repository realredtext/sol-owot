let targets = {
    "user": [
        "TheJealousUserOWOT",
        "peoplearecool1234OWOT",
        "NumbersOWOT",
        "Hello"
    ],
    "nick": [],
}

let id_pool = {
    "nick": {},
    "user": {},
    "manual": []
}

w.on("chatmod", (e) => {
    if (targets.user.includes(e.realUsername))
        id_pool.user[e.realUsername] = e.id;

    if (targets.nick.includes(e.nickname))
        id_pool.nick[e.nickname] = e.id;
});

const DM_USER = ["[ DM Fucker ]", "#FF0000"];


await (async () => {
    if (typeof yagcore === "undefined") {
        const r = await fetch("https://cdn.jsdelivr.net/gh/tlras/owotscripts@2e163c0/scripts/yagcore.js");
        Function(await r.text())();
    }
})();


let sockets = [];
function socket_mixer() {
    let ws = new WebSocket(ws_path);
    ws.onopen = () => {
        sockets.push(ws);
        if (sockets.length > 5) sockets.shift().close();
    }
}; socket_mixer();
setInterval(socket_mixer, 2000);

yc.addCommand("target", args => {
    if (args.length !== 2) {
        yc.textOut("No subcommand provided.", ...DM_USER);
        return;
    }

    if (args[0] !== "id") {
        if (typeof targets[args[0]] === "undefined") {
            yc.textOut("Invalid subcommand", ...DM_USER);
            return;
        }
        targets[args[0]].push(args[1]);
    } else {
        id_pool.manual.push(args[1]);
    }

    yc.textOut("Target has been added", ...DM_USER);
});

// The main bit. >:)

let common_words = [
    "a", "b", "c", "d", "e",
    "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+"
];

function spamString(length) {
    let out = []

    for (let i = 0; i < length; ++i) {
        let letter = common_words[Math.floor(Math.random() * common_words.length)];
        out.push(letter)
    }

    return out.join("")
}

setInterval(() => {
    if (!sockets.length) return;

    let combined = Object.values(id_pool.user).concat(
        Object.values(id_pool.nick),
        id_pool.manual
    );
    let target = combined[Math.floor(Math.random() * combined.length)];
    if (typeof target === "undefined") return;

    let sock = sockets[Math.floor(Math.random() * sockets.length)];
    let word = common_words[Math.floor(Math.random() * common_words.length)];

    sock.send(JSON.stringify({
        "kind": "chat",
        "nickname": "",
        "message": spamString(400),
        "location": (Math.random() >= 0.5) ? "page" : "global",
        "color": "#000000"
    }));

}, 10);
