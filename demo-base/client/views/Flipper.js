Menu.add({name:'Flipper',route:'views/Flipper'}, 'Views');

Router.map(function() {
  this.route('views_Flipper', {
  	path: '/views/Flipper'
  });
});

Template.flipper.rendered = function() {
  var flipperWorld = FView.byId('flipperWorld');
  flipperWorld.view.context.setPerspective(500);
}

Template.views_Flipper_front.events({
	'click': function(event, tpl) {
		var fview = FView.from(tpl);
		fview.parent.view
			.setAngle(Math.PI, { curve : 'easeOutBounce', duration : 500});
	}
});

Template.views_Flipper_back.events({
	'click': function(event, tpl) {
		var fview = FView.from(tpl);
		fview.parent.view
			.setAngle(0, { curve : 'easeOutBounce', duration : 500});
	}
});
