famousCmp.transitions = {
	opacity: {
    outTransformFrom: function(progress) {
      return Transform.Identity;
    },
    inTransformFrom: function(progress) {
      return Transform.Identity;
    }
	},
	slideWindow: {
    outTransformFrom: function(progress) {
      return Transform.translate(window.innerWidth * progress - window.innerWidth, 0, 0);
    },
    inTransformFrom: function(progress) {
      return Transform.translate(window.innerWidth * (1.0 - progress), 0, 0);
    }
	},
	WIP: {
    outTransformFrom: function(progress) {
      return Transform.rotateY(Math.PI*progress);
    },
    inTransformFrom: function(progress) {
      return Transform.rotateY(Math.PI + Math.PI*progress);
    }
	}
}

famousCmp.ready(function(require) {
	famousCmp.registerView('RenderController', famous.views.RenderController, {
		add: function(childCompView) {
			if (!this.viewNode)
				return;  // when?

			if (this.currentShow)
				this.previousShow = this.currentShow;
			this.currentShow = childCompView;

			var transition = this.component._templateInstance.data.transition;
			if (transition) {
				var data = famousCmp.transitions[transition];
				if (data) {
					for (key in data)
						this.viewNode[key](data[key]);
				} else {
					log.error('No such transition ' + transition);
				}
			}

			childCompView.preventDestroy();

			var self = this;
			this.viewNode.show(childCompView, null, function() {
				if (self.previousShow)
					self.previousShow.destroy();
			});
		}
	});
});
