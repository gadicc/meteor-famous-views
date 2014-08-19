FView.ready(function(require) {
	FView.registerView('Flipper', famous.views.Flipper, {
		add: function(childCompView) {
			var target = childCompView.component._templateInstance.data.target;
			if (!target || (target != 'back' && target != 'front'))
				throw new Error('Flipper must specify target="back/front"');

			if (target == 'front')
				this.view.setFront(childCompView);
			else
				this.view.setBack(childCompView);
		}
	});
});
