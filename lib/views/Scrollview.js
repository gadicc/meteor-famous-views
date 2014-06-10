famousCmp.ready(function(require) {
	famousCmp.registerView('Scrollview',
		require('famous/views/Scrollview'),
		{
			famousCreatedPost: function() {
				this.pipeChildrenTo = this.viewNode;
			}
		}
	);
});
