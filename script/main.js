// GraphEditor
// Main.js
"use strict";

let env;

window.onload = function () {
	env = new Environment();
	env.init();

	window.onresize = function () {
		gcanv.width = gcanv.clientWidth;
		gcanv.height = gcanv.clientHeight;

		env.draw();
	}
}
