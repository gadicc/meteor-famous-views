FView.ready(function() {
  FView.wrapComponent('Mesh', famous.webglRenderables.Mesh, {
    attrUpdate: function(key, value, oldValue, data, firstTime, cdata) {
      switch (key) {

        default:
          cdata.fvClass._super.attrUpdate(key, value, oldValue, data, firstTime);
      }
    },
  });
});