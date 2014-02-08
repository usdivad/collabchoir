(function() {
	function combine_melodies(m1, m2, m3, m4) {
		var canvas = $(".engraving canvas")[0];
		var renderer = new Vex.Flow.Renderer(canvas, Vex.Flow.Renderer.Backends.CANVAS);

		var ctx = renderer.getContext();
		var stave = new Vex.Flow.Stave(10, 0, 800);
		stave.addClef("treble").setContext(ctx).draw();

		//Creating notes
		var notes = [];

		for (var i in m1) {
			var note = new Vex.Flow.StaveNote({keys:[m1[i], m2[i], m3[i], m4[i]], duration:"q"});
			notes.push(note);
		}

		var voice = new Vex.Flow.Voice({
			num_beats: m1.length,
			beat_value: 4,
			resolution: Vex.Flow.RESOLUTION
		});

		voice.addTickables(notes);
		var formatter = new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 500);

		voice.draw(ctx, stave);
	}

	function midify(arr) {
		var new_arr = [];
		for (var i in arr) {
			new_arr.push(vex_to_midi(arr[i]));
		}
		return new_arr;
	}

	function vex_to_midi(vex) {
			//console.log(vex);
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

	$(window).load(function() {
		var m1 = ["a/3", "e/4", "c/4", "a/3", "d/4", "b/3", "g/3"];
		var m2 = ["c/4", "c/4", "g/3", "e/3", "b/3", "a/3", "b/3"];
		var m3 = ["a/4", "g/4", "b/4", "c/4", "g/3", "d/4", "d/4"];
		var m4 = ["e/4", "c/4", "e/4", "a/4", "g/4", "g/4", "g/4"];

		var m1_midi = midify(m1);
		var m2_midi = midify(m2);
		var m3_midi = midify(m3);
		var m4_midi = midify(m4);

		console.log(m1_midi);

		combine_melodies(m1, m2, m3, m4);

		//Playback
		var melody_i = 0;
		var timer = T("interval", {interval:500}, function(count) {
			var velocity = 100;
			var n1;
			var n2;
			var n3;
			var n4;
		
			synth.noteOn(m1_midi[melody_i], velocity);
			synth.noteOn(m2_midi[melody_i], velocity);
			synth.noteOn(m3_midi[melody_i], velocity);
			synth.noteOn(m4_midi[melody_i], velocity);
			console.log("asdf");

			if (melody_i < m1_midi.length) {
				melody_i += 1;
			}
			else {
				melody_i = 0;
				console.log("reset");
			}
		});

		var osc;
		var env;
		var synth;

		$("body").click(function() {
			osc = T("square");
			env = T("adsr", {a:1, d:100, s:0.2, r:500});
			synth = T("OscGen", {osc:osc, env:env, mul:0.5, freq:880}).play();
			timer.start();
		})
	});
})();