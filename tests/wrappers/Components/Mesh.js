/*
 * Like Components [cC]olor, but with "; strength"
 */
Tinytest.add('famous-views - Wrappers - Components - Mesh - glossiness', function(test) {
  var expectedColor, expectedOpacity, expectedStrength;

  var cdata = {
    instance: {
      setGlossiness: function(c, strength) {
        test.instanceOf(c, famous.utilities.Color);
        test.equal(c.getColor(), expectedColor);
        test.equal(c.getOpacity(), expectedOpacity);
        test.equal(strength, expectedStrength);
      }
    }
  };

  expectedColor = [255, 255, 255]; expectedOpacity = 1; expectedStrength = undefined;
  FView._classes.Mesh.attrUpdate('glossiness', '#ffffff',
    null, null, null, cdata);

  expectedColor = [255, 255, 255]; expectedOpacity = 0.2; expectedStrength = 500;
  FView._classes.Mesh.attrUpdate('glossiness', 'white, 0.2; 500',
    null, null, null, cdata);

  expectedColor = [255, 255, 255]; expectedOpacity = 1; expectedStrength = 500;
  FView._classes.Mesh.attrUpdate('glossiness', 'white; 500',
    null, null, null, cdata);
});
