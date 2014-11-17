Tinytest.addAsync('Famous - Context - context is bound to enclosing dom element useParent=1', function (test, complete) {
	var root = createTestDIV([200, 200], test);

	Template.FamousContextTests1.rendered = function() {
		var container = FView.byId('FamousContextTests1').context.container;
		test.equal(container.style.width, '100px');
		test.equal(container.style.height, '133px');
    complete();
	};

	Blaze.render(Template.FamousContextTests1, root);
});

Tinytest.addAsync('Famous - Context - each context is bound to enclosing dom element useParent=1', function (test, complete) {
	var root = createTestDIV([200, 200], test);

	Template.FamousContextTests2.rendered = function() {
		var containerA = FView.byId('FamousContextTests2_A').context.container;
		test.equal(containerA.style.width, '50px');
		test.equal(containerA.style.height, '50px');

		var containerB = FView.byId('FamousContextTests2_B').context.container;
		test.equal(containerB.style.width, '66px');
		test.equal(containerB.style.height, '66px');
		complete();
	};

	Blaze.render(Template.FamousContextTests2, root);
});

Tinytest.addAsync('Famous - Context - new div with style/class/id specified', function (test, complete) {
	var root = createTestDIV([200, 200], test);

	Template.FamousContextTests3.rendered = function() {
		var container = FView.byId('FamousContextTests3').context.container;
		test.equal(container.style.width, '100px');
		test.equal(container.style.height, '133px');
		test.equal(container.className, 'fview-context moo1 moo2');
		test.equal(container.id, 'FamousContextTests3');
    complete();
	};

	Blaze.render(Template.FamousContextTests3, root);
});
