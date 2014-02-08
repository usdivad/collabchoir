//Main sheet
(function() {
	//This is how you create in timbre p1...
	var osc;
	var env;
	var synth;
	//var synth = T("osc", {wave:"pulse", freq:880, mul:0.8});
	console.log(synth);
	console.log("ehy");
	var mvmt = 60;
	var display_meter = $("#meter");
	var display_io = $("#io");
	var synth_on = false;

	//Listeners
	window.addEventListener("deviceorientation", handle_orientation, true);
	$("#io").click(function() {
		if (!synth_on) {
			//...This is how you create in timbre p2
			if (typeof osc == "undefined") {
				osc = T("square");
				env = T("adsr", {a:500, d:500, s:1, r:800});
				synth = T("OscGen", {osc:osc, env:env, mul:0.8, freq:880}).play();
				console.log("built the synth");
			}
			//synth.play();
			synth.noteOn(mvmt, 100);
			display_io.css("background-color", calculate_color(mvmt));
			console.log(calculate_color(mvmt));
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
		//mvmt = event.gamma; //global mvmt
		var size = 180;
		var leftmost = -90; //essentially a subtraction
		var str = "";

		mvmt = (event.gamma + size + leftmost) * 100/size; //global mvmt, scale to 100%
		str = "mvmt: " + mvmt.toFixed(2);
		display_meter.html(str);
		console.log(str);
	}

	//Here we say fuck the sharps/accidentals because they prob won't be helpful in-game anyways
	//Percentage refers basically to a level along a scale, 0-100 (e.g. freq)
	function calculate_pitch(percentage) {
		var pitch_arr = ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4"];
		var narrow_scale = 0.95;
		var index = Math.floor((percentage/100) * narrow_scale*pitch_arr.length); //narrow it so we don't get pitch_arr.length if we do get 100
		return pitch_arr[index];
	}

	/**ENGRAVING**/
	//from tuner
	//realtime update is done by Tuner()
	const NOTEMAX=20;

	//stave
	var cv = $('.engraving canvas')[0];
	var renderer = new Vex.Flow.Renderer(cv, Vex.Flow.Renderer.Backends.CANVAS);
	var g_ctx = renderer.getContext();
	var stave = new Vex.Flow.Stave(10, 0, 800);
	stave.addClef("treble").setContext(g_ctx).draw();

	//notes
	var notes = [];

	//engrave
	var DURATION = "q";

	//In format ("c/5", g_ctx, "C0#")
	function engraveNew(k, c, p) {
		//add new note
		//var new_note = new Vex.Flow.StaveNote();
		var new_note;
		
		if (p.charAt(2) == "") {
			new_note = new Vex.Flow.StaveNote({ keys: [k], duration: "q" });
		}
		else {
			new_note = new Vex.Flow.StaveNote({ keys: [k], duration: "q" }).addAccidental(0, new Vex.Flow.Accidental("#"));
		}
		/*
		new_note.duration = "q";
		new_note.keys = [];
		if (p.charAt(2) != "")
			new_note.addAccidental(1, new Vex.Flow.Accidental("#"));
		new_note.keys.push(k);
		*/
		
		//reset staff (justifying won't work and it'll disappear otherwise)
		if (notes.length > NOTEMAX) {
			var n = notes[NOTEMAX];
			notes = [n];
		}
		//add notes to array
		notes.push(new_note);
		
		//voice creation
		var voice = new Vex.Flow.Voice({
		num_beats: 4,
		beat_value: 4,
		resolution: Vex.Flow.RESOLUTION
		});
		voice.setStrict(false);
		
		//updating voice (& clearing canvas)
		c.clearRect(0, 0, cv.width, cv.height);
		stave.setContext(g_ctx).draw(); //bad oop
		voice.addTickables(notes);
		var formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 800);
		voice.draw(c, stave);
	}

	/*function clear(pitches, engraves) {
		pitches = [];
		engraves = [];
		console.log("yes, clear!");
	} */

	/*
	engraveNew("c#/4",g_ctx,"C0#");
	engraveNew("c#/4",g_ctx,"C0#");
	clear_staff();
	*/
	
	function clear_staff() {
		g_ctx.clear();
		stave = new Vex.Flow.Stave(10, 0, 800);
		stave.addClef("treble").setContext(g_ctx).draw();
	}


})();