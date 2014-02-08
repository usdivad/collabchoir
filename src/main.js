//Main sheet
(function() {
	//var synth = T("OscGen", {osc: })
	var synth = T("pulse");
	var mvmt = 0;
	var display = $("#meter");
	window.addEventListener("deviceorientation", handle_orientation, true);

	function handle_orientation(event) {
		mvmt = event.gamma + 90; //
		display.html("mvmt: " + mvmt.toFixed(2));
		//console.log("a");
	};

	//function 


})();