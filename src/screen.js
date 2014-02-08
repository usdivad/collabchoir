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

$(window).load(function() {
	var m1 = ["a/3", "e/4", "c/4"];
	var m2 = ["d/4", "b/3", "g/3"];
	var m3 = ["e/4", "c/4", "a/3"];
	var m4 = ["b/3", "g/3", "c/3"];

	combine_melodies(m1, m2, m3, m4);
});