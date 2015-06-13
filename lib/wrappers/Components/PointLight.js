FView.ready(function() {
  var Color = famous.utilities.Color;

  FView.wrapComponent('PointLight', famous.webglRenderables.PointLight, {
    attrUpdate: function(key, value, oldValue, data, firstTime) {
      var component = this.instance;

      switch(key) {
        case 'color':
          if (_.isString(value))
            component.setColor(new Color(value))
          else
            component.setColor(value);
      }
    }
  });
});