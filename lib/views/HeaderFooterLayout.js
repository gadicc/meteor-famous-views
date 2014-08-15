famousCmp.ready(function(require) {
	famousCmp.registerView('HeaderFooterLayout', famous.views.HeaderFooterLayout, {
		add: function(childCompView) {
			var target = childCompView.component._templateInstance.data.target;
			if (!target)
				throw new Error('HeaderFooterLayout must specify target="header/footer/content"');
			this.viewNode[target].add(childCompView);
		}
	});
});
