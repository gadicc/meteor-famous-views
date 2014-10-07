Tinytest.add('famous-views - famous.js', function(test) {

	/* Preparation */

	var div = document.createElement('div');

	Template.tests_famous_surface.rendered = function() {
	};

	// famousEvents
	var famousEvents = {};
	Template.tests_famous_surface.famousEvents({
		'a': function() { famousEvents.a = 'a' },
		'b': function() { famousEvents.b = 'b' }
	});

	Blaze.render(Template.tests_famous, div);
	var surface_fview = FView.byId("tests_famous_surface");

	/* Tests */

	// famousEvents
	var events = surface_fview.surface._eventOutput.listeners;
	events.a[0]();
	test.equal(famousEvents, {a:'a'});
	events.b[0]();
	test.equal(famousEvents, {a:'a',b:'b'});

});
