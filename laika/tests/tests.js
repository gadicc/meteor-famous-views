var assert = require('assert');

suite("Data Context tests", function() {

	test("View with args must return parent data context", function(done, server, client) {

		client.eval(function() {
			FView.ready(function() {
				Template.dataContext_viewWithArgs.myData = { a: 1 };
				Template.dataContext_viewWithArgs.getData = wrap(function() {
					emit('result', this);
					//chai.assert.propertyVal(this, 'a', 1);
					//done();
				});
				Blaze.render(Template.dataContext_viewWithArgs);
			});
		});

		client.once('result', function(result) {
			assert.equal(result, 'cow');
			done();
		});

	});

});

/*
suite('Github Issues', function() {
	test("[#45] A View with no arguments renders using grandparent's data context", function(done, server, client) {
		var data = { a: 1 }

		client.eval(function() {
			FView.ready(function() {
				Template.issue45.myData = { a: 1 };
				Template.issue45.getData = function() {
					emit('result', this);
				};
				Blaze.render(Template.issue45);
			});
		});

		client.once('result', function(result) {
			assert.equal(result, false);
			done();
		});
	});
});
*/