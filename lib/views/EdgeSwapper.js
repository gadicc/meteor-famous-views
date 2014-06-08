famousCmp.ready(function(require) {
	famousCmp.registerView('EdgeSwapper',
		require('famous/views/EdgeSwapper'),
		{
			add: function(childCompView) {
				if (!this.viewNode)
					return;  // when?

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
