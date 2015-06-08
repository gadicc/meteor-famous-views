Tinytest.add('famous-views - Wrappers - Components - [Cc]olor', function(test) {
  var expectedColor, expectedOpacity;

  var cdata = {
    instance: {
      setBaseColor: function(c) {
        test.instanceOf(c, famous.utilities.Color);
        test.equal(c.getColor(), expectedColor);
        test.equal(c.getOpacity(), expectedOpacity);
      }
    }
  };

  expectedColor = [255, 255, 255]; expectedOpacity = 1;
  FView._classes._Component.attrUpdate('baseColor', 'white',
    null, null, null, cdata);

  expectedColor = [255, 255, 255]; expectedOpacity = 0.2;
  FView._classes._Component.attrUpdate('baseColor', '#ffffff, 0.2',
    null, null, null, cdata);
});