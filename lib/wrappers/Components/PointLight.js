FView.ready(function() {
  var Color = famous.utilities.Color;

  FView.wrapComponent('PointLight', famous.webglRenderables.PointLight, {
    attrUpdate: function(key, value, oldValue, data, firstTime, componentData) {
      var component = componentData.instance;

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