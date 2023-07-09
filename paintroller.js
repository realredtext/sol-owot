var l = `${" ".repeat(220) }\n`.repeat(5);
g = "";
prE = cursorCoordsCurrent;
OWOT.acceptOwnEdits = true;

var p = function(a, b, c, e, f) {
	for (var g = c, d = [], h = g, j = e, k = a, l = k, m = b, n = 0; n < f.length; ++n)
		"\n" == f.charAt(n) || "\r" == f.charAt(n) ? (7 == j ? (j = 0, m += 1) : j += 1, l = k, h = g) : (ea = [
			m,
			l,
			j,
			h,
			"",
			f.charAt(n).toString(),
			""
		], d.push(ea), 15 == h ? (h = 0, l += 1) : h += 1);
	network.write(d, false, false);
};
document.addEventListener("keydown", function (a) {
	const b = a.key;
	b.startsWith("Arrow") && (p(...prE, g), p(...cursorCoordsCurrent, l), prE = cursorCoordsCurrent);
});
