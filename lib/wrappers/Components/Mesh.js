FView.ready(function() {
  FView.wrapComponent('Mesh', famous.webglRenderables.Mesh, {
    attrUpdate: function(key, value, oldValue, data, firstTime) {
      var newValue;

      switch (key) {

        case 'glossiness':
          if (_.isString(value)) {
            newValue = value.split(";");
            newValue[0] = newValue[0].split(',');
            this.instance.setGlossiness(
                newValue[0][1] ?
                  new Color(newValue[0][0].trim())
                    .setOpacity(parseFloat(newValue[0][1])) :
                  new Color(newValue[0][0].trim()),
              newValue[1] ? parseFloat(newValue[1]) : undefined
            );
          } else if (_.isArray(value))
            this.instance.setGlossiness.apply(
              this.instance.setGlossiness, value);
          else
            this.instance.setGlossiness(value);
          break;

        default:
          this.__proto__.__proto__.attrUpdate.apply(this, arguments);
      }
    },
  });
});