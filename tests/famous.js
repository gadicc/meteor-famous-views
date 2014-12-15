Tinytest.addAsync('famous-views - famous.js - famousEvents', function(test, complete) {

	var div = document.createElement('div');
	var famousEvents = {};

	Template.tests_famous_surface.famousEvents({
		'a': function() { famousEvents.a = 'a'; },
		'b': function() { famousEvents.b = 'b'; }
	});

	Template.tests_famous_surface.rendered = function() {
		var events = FView.from(this).surface._eventOutput.listeners;
		events.a[0]();
		test.equal(famousEvents, {a:'a'});
		events.b[0]();
		test.equal(famousEvents, {a:'a',b:'b'});
		complete();
	};

	Blaze.render(Template.tests_famous, div);
});

/* --- data context tests and helper functions --- */

var myData = { a:1, b:2, c:3 };

function dataTest(tNum, test, complete) {
	var tpl = Template['tests_famous_data' + tNum];
	var div = document.createElement('div');

	Template.tests_famous_dataContextCheck.rendered = function() {
		test.equal(this.data, myData);
		complete();
	};

	tpl.helpers({ myData: _.clone(myData) });
	Blaze.render(tpl, div);
}

Tinytest.addAsync('famous-views - famous.js - dataContext - with args, template=',
	dataTest.bind(null, 1));

Tinytest.addAsync('famous-views - famous.js - dataContext - with args, inline',
	dataTest.bind(null, 2));

Tinytest.addAsync('famous-views - famous.js - dataContext - without args, inline',
	dataTest.bind(null, 3));

Tinytest.addAsync('famous-views - famous.js - dataContext - nested',
	dataTest.bind(null, 4));
