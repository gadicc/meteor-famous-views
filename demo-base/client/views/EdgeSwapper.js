// http://www.famo.us/examples/0.2.0/views/edgeswapper/example

Menu.add({name:'EdgeSwapper',route:'views/EdgeSwapper'}, 'Views');

Router.map(function() {
  this.route('views_EdgeSwapper', {
  	path: '/views/EdgeSwapper'
  });
});

Template.views_EdgeSwapper.helpers({
	'showTemplate': function() {
		return Template[this.name];
	}
});

Session.setDefault('esTemplate', 'rc_surface1');
Template.views_EdgeSwapper.helpers({
	esTemplate: function() {
		return Session.get('esTemplate');
	}
});

Template.es_buttons.helpers({
	'buttons': ['es_surface1', 'es_surface2', 'es_surface3'],
	isSet: function() {
		return this.valueOf() == Session.get('esTemplate') ? 'disabled' : '';
	}
});
Template.es_buttons.events({
	'click button': function(event, tpl) {
		Session.set('esTemplate', this.valueOf());
	}
});
