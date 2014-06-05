// http://www.famo.us/examples/0.2.0/views/rendercontroller/example

Menu.add('RenderController', 'Views');

Router.map(function() {
  this.route('views_RenderController', {
  	path: '/RenderController'
  });
});

famousCmp.registerView('RenderController',
	require('famous/views/RenderController'),
	{
		add: function(childCompView) {
			var RenderController = this.modifier
				? this.node._child._object : this.node._object;

			RenderController.show(childCompView, null, function() {
				//	destroyOldShit();
			});
		}
	}
);

Template.views_RenderController.helpers({
	'showTemplate': function() {
		return Template[this.name];
	}
});

Template.views_RenderController.rendered = function() {
//	console.log(this); 
}

Session.setDefault('currentTemplate', 'rc_surface1');
Template.views_RenderController.currentTemplate = function() {
	return Session.get('currentTemplate');
}

Template.rc_buttons.events({
	'click': function(event, tpl) {
		var id = $(event.target).data('id');
		Session.set('currentTemplate', 'rc_surface' + id);
	}
});