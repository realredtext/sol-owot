function calculatecoords(x, y) {
    return [Math.floor(y / 8),
        Math.floor(x / 16),
        y - Math.floor(y / 8) * 8,
        x - Math.floor(x / 16) * 16
       ]
};

function ajaxWrite(text, color, x, y) {
    var arr2 = [];
    var xx = 0;
    text.split('').forEach((m)=>{
        xx++;
        arr2.push(calculatecoords(x+xx, y).concat(["", m, "", color]))
    });
    var arr3 = {
        "edits":JSON.stringify(arr2)
    };
    ajaxRequest({
        type: "POST",
        url: "https://ourworldoftext.com/" + state.worldModel.pathname,
        data: arr3
    });
}; 
var str = '                       ';
for (var i = -100; i < 100; i++) {
    ajaxWrite(str.repeat(Math.floor(200/str.length)), 0, -100, i)
}
