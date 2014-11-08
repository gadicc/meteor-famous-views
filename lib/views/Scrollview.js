FView.ready(function(require) {
	FView.registerView('Scrollview', famous.views.Scrollview, {

		create: function(options) {
			var fview = this;
			var scrollview = new fview._view.constructor(options);

			fview.properties = new ReactiveDict();

			if (options.paginated) {
				fview.properties.set('index', 0);

				// famo.us pageChange event seems completely broken??
				scrollview.on('pageChange', function(props) {
					for (key in props)
						fview.properties.set(key, props[key]);
				});

				// workaround for the above:
				// - fires when event doesn't fire
				// - will override wrong value before flush
				scrollview.on('settle', function(props) {
					fview.properties.set('index',
						fview.view.getCurrentIndex());
				});
			}

			return scrollview;
		},

		famousCreatedPost: function() {
			this.pipeChildrenTo = this.parent.pipeChildrenTo
				? [ this.view, this.parent.pipeChildrenTo[0] ]
				: [ this.view ];
		}

	});
});
