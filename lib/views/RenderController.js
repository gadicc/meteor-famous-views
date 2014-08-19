FView.transitions = {
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

FView.ready(function(require) {
	FView.registerView('RenderController', famous.views.RenderController, {
		add: function(child_fview, child_options) {
			if (!this.view)
				return;  // when?

			if (this.currentShow)
				this.previousShow = this.currentShow;
			this.currentShow = child_fview;

			var transition = child_options.transition;
			if (transition) {
				var data = FView.transitions[transition];
				if (data) {
					for (key in data)
						this.view[key](data[key]);
				} else {
					log.error('No such transition ' + transition);
				}
			}

			child_fview.preventDestroy();

			var self = this;
			this.view.show(child_fview, null, function() {
				if (self.previousShow)
					self.previousShow.destroy();
			});
		}
	});
});
