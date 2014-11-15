FView.ready(function(require) {
	FView.registerView('ContainerSurface', famous.surfaces.ContainerSurface, {

		add: function(child_fview, child_options) {
			this.view.add(child_fview);
    },

    attrUpdate: function(key, value, oldValue, data, firstTime) {
			if (key == 'overflow')
				this.view.setProperties({ overflow: value });
			else if (key == 'class')
				this.view.setClasses(value.split(" "));
			else if (key == 'perspective')
				this.view.context.setPerspective(value);
		}
	});
});
