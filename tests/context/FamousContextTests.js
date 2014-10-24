Tinytest.addAsync('Famous - Context - context is bound to enclosing dom element', function (test, complete) {
	var root = createTestDIV([200, 200], test);

	Blaze.render(Template.FamousContextTests1, root);

  Meteor.setTimeout(function () {
      var surface = $('.FamousContextTests1').one();

			test.equal(surface.width(), 100);
			test.equal(surface.height(), 133);

      complete();
    },
    150);
});

Tinytest.addAsync('Famous - Context - each context is bound to enclosing dom element', function (test, complete) {
	var root = createTestDIV([200, 200], test);

	Blaze.render(Template.FamousContextTests2, root);

	Meteor.setTimeout(function () {
			var surfaceA = $('.FamousContextTests2_A').one();

			test.equal(surfaceA.width(), 50);
			test.equal(surfaceA.height(), 50);

			var surfaceB = $('.FamousContextTests2_B').one();

			test.equal(surfaceB.width(), 66);
			test.equal(surfaceB.height(), 66);

			complete();
		},
		150);
});