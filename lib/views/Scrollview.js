famousCmp.ready(function(require) {
	famousCmp.registerView('Scrollview', famous.views.Scrollview, {
		famousCreatedPost: function() {
			this.pipeChildrenTo = this.parent.pipeChildrenTo
				? [ this.viewNode, this.parent.pipeChildrenTo[0] ]
				: [ this.viewNode ];
		}
	});
});
