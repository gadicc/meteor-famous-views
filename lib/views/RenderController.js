function fullOpacity() { return 1; }
function transformIdentity() { return Transform.Identity; }

FView.transitions = {
	opacity: {
		outOpacityFrom: function (progress) {
    	return progress;
		},
    inOpacityFrom: function (progress) {
			return progress;
    },
    outTransformFrom: transformIdentity, inTransformFrom: transformIdentity
	},
	slideWindow: {
    outTransformFrom: function(progress) {
      return Transform.translate(window.innerWidth * progress - window.innerWidth, 0, 0);
    },
    inTransformFrom: function(progress) {
      return Transform.translate(window.innerWidth * (1.0 - progress), 0, 0);
    },
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity
	},
	WIP: {
    outTransformFrom: function(progress) {
      return Transform.rotateY(Math.PI*progress);
    },
    inTransformFrom: function(progress) {
      return Transform.rotateY(Math.PI + Math.PI*progress);
    },
    inOpacityFrom: fullOpacity, outOpacityFrom: fullOpacity
	}
};

// Other option is to allow a slideDirection attribute.  Think about this.
FView.transitions.slideWindowLeft = FView.transitions.slideWindow;
FView.transitions.slideWindowRight = {
    outTransformFrom: FView.transitions.slideWindow.inTransformFrom,
    inTransformFrom: FView.transitions.slideWindow.outTransformFrom
};

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
		},

		attrUpdate: function(key, value, oldValue, data, firstTime) {
			if (key == 'transition') {
				var data = FView.transitions[value];
				if (data) {
					for (key in data)
						this.view[key](data[key]);
				} else {
					log.error('No such transition ' + transition);
				}				
			}
		}
	});
});
