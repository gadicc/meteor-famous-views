FView.ready(function(require) {
	FView.registerView('HeaderFooterLayout', famous.views.HeaderFooterLayout, {
		add: function(child_fview, child_options) {
			var target = child_options.target;
			if (!target)
				throw new Error('HeaderFooterLayout children must specify target="header/footer/content"');
			this.view[target].add(child_fview);
		}
	});
});
