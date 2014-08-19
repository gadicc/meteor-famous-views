FView.ready(function(require) {
	FView.registerView('HeaderFooterLayout', famous.views.HeaderFooterLayout, {
		add: function(childCompView) {
			var target = childCompView.component._templateInstance.data.target;
			if (!target)
				throw new Error('HeaderFooterLayout must specify target="header/footer/content"');
			this.view[target].add(childCompView);
		}
	});
});
