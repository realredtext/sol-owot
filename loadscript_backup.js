//if fp wants to stop you from loading fun tools
w.loadScript = function(url, callback) {
		var script = document.createElement("script");
		if(callback === true) {
			// synchronous
			ajaxRequest({
				type: "GET",
				url: url,
				async: true,
				done: function(e) {
					script.innerText = e;
					document.head.appendChild(script);
				}
			});
		} else {
			script.src = url;
			document.head.appendChild(script);
			script.onload = callback;
		}
	}
