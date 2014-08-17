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

Template.nameSliderValue.events({
	'input input': function(event, tpl) {
		var $target = $(event.target);
		var name = $target.attr('name');
		var value = $target.val();
		Session.set(name, value);
	}
});

Session.setDefault('skewX', 0); Session.setDefault('skewY', 0);
Session.setDefault('sizeX', 100); Session.setDefault('sizeY', 100);

Template.reactivity.sess = Template.reactivityModState.sess = {};
var props = ['skewX', 'sizeX', 'skewY', 'sizeY'];
_.each(props, function(prop) {
	Template.reactivity.sess[prop] = function() { return Session.get(prop); }
});

Template.reactivity.getSize = function() {
	return [ Session.get('sizeX'), Session.get('sizeY' )];
}