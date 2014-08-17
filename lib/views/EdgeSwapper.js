famousCmp.ready(function(require) {
	famousCmp.registerView('EdgeSwapper', famous.views.EdgeSwapper, {
		add: function(childCompView) {
			if (!this.view)
				return;  // when?

			if (this.currentShow)
				this.previousShow = this.currentShow;
			this.currentShow = childCompView;

			childCompView.preventDestroy();

			var self = this;
			this.view.show(childCompView, null, function() {
				if (self.previousShow)
					self.previousShow.destroy();
			});
		}
	});
});
