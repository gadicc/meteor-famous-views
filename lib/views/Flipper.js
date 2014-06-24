famousCmp.ready(function(require) {
	famousCmp.registerView('Flipper', famous.views.Flipper, {
		add: function(childCompView) {
			var target = childCompView.component.templateInstance.data.target;
			if (!target || (target != 'back' && target != 'front'))
				throw new Error('Flipper must specify target="back/front"');

			if (target == 'front')
				this.viewNode.setFront(childCompView);
			else
				this.viewNode.setBack(childCompView);
		}
	});
});
