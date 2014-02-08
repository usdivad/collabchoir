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
	var prev_mvmt = 60;
	var note_arr = [];

	//numbers
	var gamma_min = 0;
	var gamma_max = 100;

	//LISTENERS
	window.addEventListener("deviceorientation", handle_orientation, true);
	$("#io").bind("mousedown", function(e) {
		if (!synth_on) {
			//...This is how you create in timbre p2
			if (typeof synth == "undefined") {
				/*
				osc = T("square");
				env = T("adsr", {a:500, d:500, s:1, r:800});
				synth = T("OscGen", {osc:osc, env:env, mul:0.8, freq:880}).play();
				*/
				synth = T("osc", {wave:"pulse", freq:midi_to_hz(mvmt), mul:1});
				synth.play();
				console.log("built the synth");
			}
			synth.play();
			//synth.noteOn(vex_to_midi(calculate_pitch(mvmt)), 100);
			//console.log(calculate_pitch(mvmt));

			display_io.css("background-color", "blue");
			var midi_pitch = vex_to_midi(calculate_pitch(mvmt));
			synth.freq.value = midi_to_hz(midi_pitch+12);
			note_arr.push(midi_pitch);
			//console.log(note_arr);
			//synth_on = true;
			console.log(synth);

			/*T("timeout", {timeout:1000}).on("ended", function() {
				console.log("timeout done");
			}).start();*/

			var interval = 100;;
			var count = 5;
			var counter = setInterval(timer, interval);
			function timer() {
				if (count <= 0) {
					clearInterval(counter);
					synth_on = true;
					synth.pause();
					console.log("TIMER DONE");
					console.log(note_arr);
					return;
				}
				count -= 0.1;
				console.log(count.toFixed(1));
			}
		}
		else {
			/*synth.pause();
			//synth.allNoteOff();
			display_io.css("background-color", "black");
			synth_on = false;*/
		}
		console.log(synth_on);
		e.stopPropagation();
		e.preventDefault();
	});

	$("#io").bind("mouseup", function(e) {
			display_io.css("background-color", "black");
			synth.freq.value = midi_to_hz(vex_to_midi(calculate_pitch(mvmt)));
			engraveNew(calculate_pitch(mvmt), g_ctx, "C3");

	});

	function handle_orientation(event) {
		//mvmt = event.gamma; //global mvmt
		var size = 180;
		var leftmost = -90; //essentially a subtraction
		var str = "";

		prev_mvmt = mvmt;
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

		if (calculate_pitch(mvmt) != calculate_pitch(prev_mvmt)) {
			synth.freq.value = midi_to_hz(vex_to_midi(calculate_pitch(mvmt)));
		}

		//clear_stave();
		//console.log(g_ctx);
		//console.log("cleared");
		//engrave_new(calculate_pitch(mvmt), g_ctx, "C3");
		//if (synth_on) {
			display_io.css("background-color", calculate_color(mvmt));
		//}
	}


	//PARSING, CALCULATING DATA

	function calculate_color(mvmt) {
		var s = "rgb(0,";
		s += Math.floor((mvmt/100) * 255);
		s += ",0)";
		return s;
	}

	//Here we say fuck the sharps/accidentals because they prob won't be helpful in-game anyways
	//Percentage refers basically to a level along a scale, 0-100 (e.g. freq)
	function calculate_pitch(percentage) {
		var pitch_arr = ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4"];
		var narrow_scale = 0.95;
		var index = Math.floor((percentage/100) * narrow_scale*pitch_arr.length); //narrow it so we don't get pitch_arr.length if we do get 100
		return pitch_arr[index];
	}

	//"c#/3" ==> "C#3" ==> 61 (we output the number itself)
	function vex_to_midi(vex) {
		console.log(vex);
		var octave = vex.slice(vex.length-1, vex.length); "3"
		var tv = vex.slice(0, vex.length-1); "c#/"
		var note = tv.slice(0, tv.length-1); "c#"
		var map = {
			"c": 0,
			"c#": 1,
			"d": 2,
			"d#": 3,
			"e": 3,
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
		//console.log("MIDI: " + midi_base + "+" + midi_icing + " = " + midi_final);
		return midi_final;
	}


	//converts midi to hz
	/**TRANSPOSES IT!!!! for volume purposes for the devfest demo**/
	function midi_to_hz(midi)
	{
		var freq = (330 / 32) * (Math.pow(2,((midi+12 - 9) / 12)));
		return freq;
	}

	/**ENGRAVING**/
	//from tuner
	//realtime update is done by Tuner()
	const NOTEMAX=5; //1 just shows 1, 20 shows 20 at a time

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
		num_beats: 3,
		beat_value: 3,
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

	//Not working yet
	function engrave_new(key) {
		clear_stave();
		var notes = [new Vex.Flow.StaveNote({keys:[key], duration:"q"})];
		var voice = new Vex.Flow.Voice({
		    num_beats: 3,
		    beat_value: 3,
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
	engraveNew("c#/3",g_ctx,"C0#");
	engraveNew("c#/3",g_ctx,"C0#");
	clear_stave();
	*/
	
	function clear_stave() {
		g_ctx.clear();
		stave = new Vex.Flow.Stave(10, 0, 800);
		stave.addClef("treble").setContext(g_ctx).draw();
	}

	//GAME BRAIN
	//melody is tied to the local pitch_arr (not so cool)
	var melody = [];


})();