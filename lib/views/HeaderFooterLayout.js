FView.ready(function(require) {
	FView.registerView('HeaderFooterLayout', famous.views.HeaderFooterLayout, {
		add: function(child_fview) {
			var target = child_fview.blazeView._templateInstance.data.target;
			if (!target)
				throw new Error('HeaderFooterLayout must specify target="header/footer/content"');
			this.view[target].add(child_fview);
		}
	});
});
