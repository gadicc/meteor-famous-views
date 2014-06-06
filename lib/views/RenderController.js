Meteor.startup(function() {
	famousCmp.registerView('RenderController',
		require('famous/views/RenderController'),
		{
			add: function(childCompView) {
				if (this.currentShow)
					this.previousShow = this.currentShow;
				this.currentShow = childCompView;

				childCompView.preventDestroy();

				var self = this;
				this.viewNode.show(childCompView, null, function() {
					if (self.previousShow)
						self.previousShow.destroy();
				});
			}
		}
	);
});
