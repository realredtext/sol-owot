function spam(str, len, wid) {
    var s = str.repeat(len);
    s += "\n";
    s = s.repeat(wid);
    for(var i = 0; i < s.length; i++) {
        var c = s[i];
        writeChar(c,false)
    }
}
