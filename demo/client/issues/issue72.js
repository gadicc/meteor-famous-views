Menu.add({name:'#72 if order',route:'issue72'}, 'Issues');

Router.map(function() {
  this.route('issue72');
});

Template.issue72.show = Template.issue72_buttons.show = function(surface) {
	return Session.get(surface);
};

Template.issue72.helpers({
	items: function() {
		return Items.find({}, {limit: 3});
	}
});

Session.setDefault('showIf', true);
Template.issue72.showIf = function() {
	return Session.get('showIf');
}


Template.issue72_surfaceA.rendered = function() {
	var fview = FView.from(this);
	fview.preventDestroy();
	fview.onDestroy = function() {
		window.setTimeout(function() {
			fview.destroy();
		}, 1000);
	};
}

Session.setDefault('A', true);
Session.setDefault('B', true);
Session.setDefault('C', true);
Template.issue72_buttons.events({
	'change': function(event, tpl) {
		var el = $(event.target);
		Session.set(el.val(), el.is(':checked'));
	}
});