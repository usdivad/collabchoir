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

	//numbers
	var gamma_min = 0;
	var gamma_max = 100;

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
			synth.noteOn(vex_to_midi(calculate_pitch(mvmt)), 100);
			console.log(calculate_pitch(mvmt));
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
		//console.log(str);

		if (mvmt > 100) {
			mvmt = 100;
		}
		if (mvmt < 0) {
			mvmt = 0;
		}

		clear_stave();
		//console.log(g_ctx);
		//console.log("cleared");
		//engrave_new(calculate_pitch(mvmt), g_ctx, "C4");
		engraveNew(calculate_pitch(mvmt), g_ctx, "C4");
		display_io.css("background-color", calculate_color(mvmt));
	}

	function calculate_color(mvmt) {
		var s = "rgb(0,";
		s += Math.floor((mvmt/100) * 255);
		s += ",0)";
		return s;
	}

	//Here we say fuck the sharps/accidentals because they prob won't be helpful in-game anyways
	//Percentage refers basically to a level along a scale, 0-100 (e.g. freq)
	function calculate_pitch(percentage) {
		var pitch_arr = ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f/5", "g/5", "a/5", "b/5"];
		var narrow_scale = 0.95;
		var index = Math.floor((percentage/100) * narrow_scale*pitch_arr.length); //narrow it so we don't get pitch_arr.length if we do get 100
		return pitch_arr[index];
	}

	//"c#/4" ==> "C#4"
	function vex_to_midi(vex) {
		console.log(vex);
		var octave = vex.slice(vex.length-1, vex.length); "4"
		var tv = vex.slice(0, vex.length-1); "c#/"
		var note = tv.slice(0, tv.length-1); "c#"
		var map = {
			"c": 0,
			"c#": 1,
			"d": 2,
			"d#": 3,
			"e": 4,
			"f": 5,
			"f#": 6,
			"g": 7,
			"g#": 8,
			"a": 9,
			"a#": 10,
			"b": 11
		};
		var midi_base = octave*12 + 12;
		var midi_icing;
		if (typeof map[note] != "undefined") {
			midi_icing = map[note];
		}
		else {
			midi_icing = 0;
		}
		var midi_final = midi_base+midi_icing;
		console.log("MIDI: " + midi_base + "+" + midi_icing + " = " + midi_final);
		return midi_icing;
	}

	/**ENGRAVING**/
	//from tuner
	//realtime update is done by Tuner()
	const NOTEMAX=1; //1 just shows 1, 20 shows 20 at a time

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

	function engrave_new(key) {
		clear_stave();
		var notes = [new Vex.Flow.StaveNote({keys:[key], duration:"q"})];
		var voice = new Vex.Flow.Voice({
		    num_beats: 4,
		    beat_value: 4,
		    resolution: Vex.Flow.RESOLUTION
		 });
		voice.addTickables(notes);
		//var formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 800);
		voice.draw(g_ctx, stave);
	}

	/*function clear(pitches, engraves) {
		pitches = [];
		engraves = [];
		console.log("yes, clear!");
	} */

	/*
	engraveNew("c#/4",g_ctx,"C0#");
	engraveNew("c#/4",g_ctx,"C0#");
	clear_stave();
	*/
	
	function clear_stave() {
		g_ctx.clear();
		stave = new Vex.Flow.Stave(10, 0, 800);
		stave.addClef("treble").setContext(g_ctx).draw();
	}


})();