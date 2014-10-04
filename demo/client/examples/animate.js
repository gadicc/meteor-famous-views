Menu.add({name:'Animations',route:'examples/animate'}, 'Examples');

Router.map(function() {
  this.route('examples_animate', { path: '/examples/animate' });
});

var uiItems = new Meteor.Collection();

Template.examples_animate_buttons.events({
	'click #insert': function() {
		var allItems = Items.find().fetch();
		var idx = Math.round((allItems.length-1) * Math.random());
		delete allItems[idx]._id;
		uiItems.insert(allItems[idx]);
	},
	'click #remove': function() {
		var allItems = uiItems.find().fetch();
		var idx = Math.round((allItems.length-1) * Math.random());
		uiItems.remove(allItems[idx]._id);
	}
});

// Reactive query, sorted by name, for items
Template.examples_animate.helpers({
	'items': function() {
		return uiItems.find({}, { sort: { name : 1 } });
	}
});

// Remove the clicked item from the collection
Template.examples_animate_item.events({
	'click': function(event, tpl) {
		uiItems.remove(this._id);
	}
});

Template.examples_animate_item.rendered = function() {
	var fview = FView.from(this);

	// Set origin to center, and align middle left
	fview.modifier.setOrigin([.5,.5]);
	fview.modifier.setAlign([0,.5]);

	// Start off with width 0, scaled to zero and rotated half a revolution
	fview.modifier.setSize([0,100]);
	fview.modifier.setTransform(
		Transform.multiply(Transform.rotate(0,0,-Math.PI), Transform.scale(0.001,0.001))
	);

	// Transition back to full size, then full scale and zero rotation
	fview.modifier.setSize([100,100], { duration: 1000, curve: 'easeOut' }, function() {
		fview.modifier.setTransform(
			Transform.multiply(Transform.rotate(0,0,0), Transform.scale(1,1)),
			{ duration: 1000, curve: 'easeOut' }
		);
	});

  // Disable auto-cleanup.  Must call fview.destroy() in onDestroy callback.
	fview.preventDestroy();

	fview.onDestroy = function() {
		var fview = this;
		// First spin and scale to 0
		fview.modifier.setTransform(
			Transform.multiply(Transform.scale(0.001,0.001), Transform.rotate(0,0,-Math.PI)),
			{ duration: 1000, curve: 'easeOut' },
			function() {
				// when spin+scale is done, shrink the width
				fview.modifier.setSize([0,0], { duration: 1000, curve: 'easeOut' }, function() {
					// Finally after everything, do proper cleanup
					fview.destroy();
				});
			}
		);
	}
}