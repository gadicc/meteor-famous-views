famousCmp.ready(function(require) {
	famousCmp.registerView('Surface', famous.core.Surface, {

    attrUpdate: function(key, value, data, firstTime) {
    	switch(key) {
    		case 'size':
    			this.surface.setSize(value);
    			break;
    	}
    }

	});
});
