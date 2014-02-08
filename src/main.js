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
	var timer_started = false;
	var timer_done = false;
	var prev_mvmt = 60;
	var note_arr = [];

	//numbers
	var gamma_min = 0;
	var gamma_max = 100;

	//LISTENERS
	//Touching the "Capture" button
	$("#io").bind("mousedown", function(e) {
		if (!timer_done) {
			if (!timer_started) { //initiate the timer etc.
				//Add orientation listener
				window.addEventListener("deviceorientation", handle_orientation, true);


				//timer!
				timer_started = true;
				var interval = 100;
				var count = 8; //# of seconds the timer runs for
				var counter = setInterval(timer, interval);
				function timer() {
					//The timer is done:
					if (count <= 0.1) {
						clearInterval(counter);
						timer_done = true;
						synth.pause();
						console.log("TIMER DONE");
						console.log(note_arr);

						//scoring!
						var max_score = melody.length * 12; //12 being the range, max that can be subtracted
						var your_score = evaluate_score(melody, note_arr);
						var score_str = ((your_score/max_score)*100).toFixed(2) + "%";
						display_io.html(score_str);
						console.log("Your score is " + score_str);
						return note_arr;
					}
					//Timer is still going
					else {
						count -= 0.1;
						$("#timer").html("Time left: " + count.toFixed(1));
						console.log(count.toFixed(1));
					}
				}
			}

			//...This is how you create in timbre p2
			//correlated with the timer but good to have separate checks
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

			//touch
			display_io.css("background-color", "black");
			var midi_pitch = vex_to_midi(calculate_pitch(mvmt));
			synth.freq.value = midi_to_hz(midi_pitch+12); //octave indicates touch too
			if (note_arr.length < NOTEMAX) {
				note_arr.push(midi_pitch);
			}
			//console.log(note_arr);
			//timer_done = true;
			console.log(synth);

			/*T("timeout", {timeout:1000}).on("ended", function() {
				console.log("timeout done");
			}).start();*/


		}
		else {
			/*synth.pause();
			//synth.allNoteOff();
			display_io.css("background-color", "black");
			timer_done = false;*/
		}
		console.log(timer_done);
		e.stopPropagation();
		e.preventDefault();
	});

	//On release
	$("#io").bind("mouseup", function(e) {
			display_io.css("background-color", "black");
			if (!timer_done) {
				synth.freq.value = midi_to_hz(vex_to_midi(calculate_pitch(mvmt))); //back to normal
				engraveNew(calculate_pitch(mvmt), g_ctx, "C3"); //engrave on user input stave
			}
			else { //timer is done
				synth.pause();
			}

	});

	//Function called when orientation change is detected
	function handle_orientation(event) {
		//mvmt = event.gamma; //global mvmt
		var size = 180;
		var leftmost = -90; //essentially a subtraction
		var str = "";

		//Get gamma value
		prev_mvmt = mvmt;
		mvmt = (event.gamma + size + leftmost) * 100/size; //global mvmt, scale to 100%
		str = "mvmt: " + mvmt.toFixed(2);
		display_meter.html(str);
		//console.log(str);

		//Setting max/min thresholds
		if (mvmt > 100) {
			mvmt = 100;
		}
		if (mvmt < 0) {
			mvmt = 0;
		}

		//Prevent repeats (dubious)
		if (calculate_pitch(mvmt) != calculate_pitch(prev_mvmt)) {
			synth.freq.value = midi_to_hz(vex_to_midi(calculate_pitch(mvmt)));
		}

		//clear_stave();
		//console.log(g_ctx);
		//console.log("cleared");
		//engrave_new(calculate_pitch(mvmt), g_ctx, "C3");
		//if (timer_done) {
			//Color transition
			display_io.css("background-color", calculate_color(mvmt));
		//}
	}


	//PARSING, CALCULATING DATA

	//Calc color transition (blue green)
	function calculate_color(mvmt) {
		var green_value = Math.floor((mvmt/100) * 255);
		var blue_value = 255-green_value;
		var s = "rgb(0," + green_value + "," + blue_value + ")";
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
		var midi_icing; //how many notes above the base C
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
	//Engrave given melody; GAME BRAIN
	var melody = ["a/3", "e/4", "c/4", "a/3", "d/4", "b/3", "g/3"];

	var melo_cv = $(".given_melody canvas")[0];
	var melo_renderer = new Vex.Flow.Renderer(melo_cv, Vex.Flow.Renderer.Backends.CANVAS);
	var melo_ctx = melo_renderer.getContext();
	var melo_stave = new Vex.Flow.Stave(10, 0, 500);
	var melo_notes = [];
	melo_stave.addClef("treble").setContext(melo_ctx).draw();


	for (var i in melody) {
		melo_notes.push(new Vex.Flow.StaveNote({keys:[melody[i]], duration:"q"}));
	}

	  function create_melo_voice() {
	    return new Vex.Flow.Voice({
	      num_beats: melo_notes.length,
	      beat_value: 4,
	      resolution: Vex.Flow.RESOLUTION
	    });
	  }

	var melo_voice = create_melo_voice().addTickables(melo_notes);
	var formatter = new Vex.Flow.Formatter().joinVoices([melo_voice]).format([melo_voice], 500);
	melo_voice.draw(melo_ctx, melo_stave);


	//GAME BRAIN evaluation
	//given_arr in vex (a/4) format, user_arr in midi pitches already
	function evaluate_score(given_arr, user_arr) {
		//format
		var given_formatted = [];
		for (var i in given_arr) {
			console.log("given_arr " + given_arr[i]);
			var note_formatted = vex_to_midi(given_arr[i]);
			given_formatted.push(note_formatted);
		}

		//compare
		var user_score = 0;
		for (var i in user_arr) {
			var note_user = user_arr[i];
			var note_given = given_formatted[i];
			var diff = Math.abs(note_user-note_given);
			user_score += 12-diff;
		}

		return user_score;

	}

	//-------------

	//ENGRAVING user input
	//from tuner
	//realtime update is done by Tuner()
	const NOTEMAX=melo_notes.length; //1 just shows 1, 20 shows 20 at a time

	//stave
	var cv = $('.engraving canvas')[0];
	var renderer = new Vex.Flow.Renderer(cv, Vex.Flow.Renderer.Backends.CANVAS);
	var g_ctx = renderer.getContext();
	var stave = new Vex.Flow.Stave(10, 0, 500);
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
			//var n = notes[NOTEMAX];
			//notes = [n];

			//stop collecting
			/*clearInterval(counter);
			timer_done = true;
			synth.pause();
			console.log("TIMER DONE");
			console.log(note_arr);
			return;*/
		}
		else {
			//add notes to array
			notes.push(new_note);
		}
		
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
		var formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 500);
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
		var formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 500);
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

	window.scroll(0,1);



	//Playback after the fact (integrate into the Angular files)
	//var playback_on = false;
	var playing = false;
	var playback_osc;
	var playback_env;
	var playback_synth;
	var playback_i = 0;
	$("body").click(function() {
		if (timer_done) { //should be playback_on
			console.log("foo");
			playback_osc = T("square");
			playback_env = T("adsr", {a:10, d:100, s:1, r:500});
			playback_synth = T("OscGen", {osc:osc, env:env, mul:4, freq:880}).play();
			//playback_timer.start();

			if (playing) {
				playback_timer.stop();
				playing = false;
			}
			else {
				playback_timer.start();
				playing = true;
				console.log("start");
			}
		}
	});
	var playback_timer = T("interval", {interval:500}, function(count) {
			var velocity = 100;
			
			var note = note_arr[playback_i];
			playback_synth.noteOn(note, velocity);
			
			console.log("asdf");

			if (playback_i < note_arr.length) {
				playback_i += 1;
			}
			else {
				playback_i = 0;
				console.log("reset");
			}
		});
})();