Router.map(function() {
  this.route('reactivity', {
  	path: '/features/reactivity'
  });
});

x = null;
Template.reactiveBlock.rendered = function() {
	var famousData = famousCmp.dataFromTemplate(this);
	x = famousData.modifier;
};

Template.reactivityIntro.events({
	'input input': function(event, tpl) {
		var $target = $(event.target);
		var name = $target.attr('name');
		var value = $target.val();
		Session.set(name, value);
	}
});


Session.setDefault('skewX', 0); Session.setDefault('skewY', 0);
Template.reactivity.getSkewX = function() { return Session.get('skewX'); };
Template.reactivity.getSkewY = function() { return Session.get('skewY'); };

Template.reactivityIntro.getSkewX = Template.reactivity.getSkewX;
Template.reactivityIntro.getSkewY = Template.reactivity.getSkewY;
