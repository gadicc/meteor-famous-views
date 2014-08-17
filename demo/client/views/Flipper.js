// http://www.famo.us/docs/0.2.0/views/HeaderFooterLayout/

Menu.add({name:'Flipper',route:'views/Flipper'}, 'Views');

Router.map(function() {
  this.route('views_Flipper', {
  	path: '/views/Flipper'
  });
});

// TODO, put flipper in it's own context
function perspectiveZero() {
	famousCmp.mainCtx.setPerspective(0);
}

Template.views_Flipper_front.events({
	'click': function(event, tpl) {
		var famousData = famousCmp.dataFromTemplate(tpl);
		famousCmp.mainCtx.setPerspective(500);
		famousData.parent.view
			.setAngle(Math.PI, { curve : 'easeOutBounce', duration : 500},
				perspectiveZero);
	}
});

Template.views_Flipper_back.events({
	'click': function(event, tpl) {
		var famousData = famousCmp.dataFromTemplate(tpl);
		famousCmp.mainCtx.setPerspective(500);
		famousData.parent.view
			.setAngle(0, { curve : 'easeOutBounce', duration : 500},
				perspectiveZero);
	}
});
