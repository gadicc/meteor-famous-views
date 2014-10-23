FView.ready(function(require) {
	FView.registerView('Surface', famous.core.Surface, {

		add: function(child_fview, child_options) {
			var blazeView = this.blazeView;

		  log.error("You tried to embed a " + child_fview._view.name + " inside a Surface"
		    + ' (parent: ' + parentViewName(blazeView) + ','
		    + ' template: ' + parentTemplateName(blazeView) + ').  '
		    + "Surfaces are endpoints in the Famous Render Tree and may not contain "
		  	+ "children themselves.  See "
		    + "https://github.com/gadicc/meteor-famous-views/issues/78 for more info.");

			throw new Error("Cannot add View to Surface");
		},

    attrUpdate: function(key, value, oldValue, data, firstTime) {
    	switch(key) {
    		case 'size':
    			// Let our modifier control our size
    			// Long term, rather specify modifierSize and surfaceSize args?
    			if (this._modifier.name == 'StateModifier')
						this.surface.setSize([undefined,undefined]);
    			else {
            this.surface.setSize(value);
          }
    			break;

        case 'class' :
          if (Match.test(value, String))
            value = value.split(" ");
          else if (!Match.test(value, [String]))
            throw new Error('Surface class= expects string or array of strings');
          value.push(this.surfaceClassName);
          this.view.setClasses(value);
          break;

        case 'properties' :
          this.view.setProperties(value);
          break;
    	}
    }

	});
});
