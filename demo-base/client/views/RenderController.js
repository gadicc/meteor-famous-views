// http://www.famo.us/examples/0.2.0/views/rendercontroller/example

Menu.add({name:'RenderController',route:'views/RenderController'}, 'Views');

Router.map(function() {
  this.route('views_RenderController', {
  	path: '/views/RenderController'
  });
});

Session.setDefault('currentTemplate', 'rc_surface1');
Session.setDefault('currentTransition', 'opacity');

Template.views_RenderController.helpers({
	currentTemplate: function() {
		return Session.get('currentTemplate');
	},
	'showTemplate': function() {
		return Template[this.name];
	},
	'getTransition': function() {
		return Session.get('currentTransition');
	}
});

Template.rc_buttons.helpers({
	'buttons': ['rc_surface1', 'rc_surface2', 'rc_surface3'],
	isSet: function() {
		return this.valueOf() == Session.get('currentTemplate') ? 'set' : '';
	}
});
Template.rc_buttons.events({
	'click button': function(event, tpl) {
		Session.set('currentTemplate', this.valueOf());
	}
});

Template.rc_transitions.helpers({
	'transitions': _.keys(FView.transitions),
	isSet: function() {
		return this.valueOf() == Session.get('currentTransition') ? 'set' : '';
	}
});
Template.rc_transitions.events({
	'click button': function() {
		Session.set('currentTransition', this.valueOf());
	}
});

Session.setDefault('transitionPages', false);
Template.rc_useForPages.events({
	'change': function() {
		Session.set('transitionPages', $(event.target).is(':checked'));
	}
});
Template.rc_useForPages.helpers({
	'checked': function() {
		return Session.get('transitionPages');
	}
})