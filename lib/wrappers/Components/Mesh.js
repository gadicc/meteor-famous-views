FView.ready(function() {
  FView.wrapComponent('Mesh', famous.webglRenderables.Mesh, {
    attrUpdate: function(key, value, oldValue, data, firstTime, cdata) {
      var newValue;

      switch (key) {

        case 'glossiness':
          if (_.isString(value)) {
            newValue = value.split(";");
            newValue[0] = newValue[0].split(',');
            cdata.instance.setGlossiness(
                newValue[0][1] ?
                  new Color(newValue[0][0].trim())
                    .setOpacity(parseFloat(newValue[0][1])) :
                  new Color(newValue[0][0].trim()),
              newValue[1] ? parseFloat(newValue[1]) : undefined
            );
          } else if (_.isArray(value))
            cdata.instance.setGlossiness.apply(
              cdata.instance.setGlossiness, value);
          else
            cdata.instance.setGlossiness(value);
          break;

        default:
          cdata._class._super.attrUpdate(key, value, oldValue, data, firstTime, cdata);
      }
    },
  });
});