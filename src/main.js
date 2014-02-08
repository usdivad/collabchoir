//Main sheet
(function() {
	var osc = T("square");
	var env = T("adsr", {a:500, d:500, s:1, r:800});
	//var synth = T("osc", {wave:"pulse", freq:880, mul:0.8});
	var synth = T("OscGen", {osc:osc, env:env, mul:0.8, freq:880}).play();
	console.log(synth);
	var mvmt = 60;
	var display_meter = $("#meter");
	var display_io = $("#io");
	var synth_on = false;

	//Listeners
	window.addEventListener("deviceorientation", handle_orientation, true);
	$("#io").click(function() {
		if (!synth_on) {
			//synth.play();
			synth.noteOn(mvmt, 100);
			display_io.css("background-color", "green");
			synth_on = true;
			console.log(synth);
		}
		else {
			//synth.pause();
			synth.allNoteOff();
			display_io.css("background-color", "black");
			synth_on = false;
		}
		console.log(synth_on);
	});

	function handle_orientation(event) {
		mvmt = (event.gamma + 90) * 100/180; //scale to 100%
		display_meter.html("mvmt: " + mvmt.toFixed(2));
		//console.log("a");
	};

	//function 


})();