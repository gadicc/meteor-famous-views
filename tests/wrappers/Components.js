Tinytest.add('famous-views - Wrappers - Components - [Cc]olor', function(test) {
  var expectedColor, expectedOpacity;

  comp = new FView._classes._Component();
  comp.instance = {

    setBaseColor: function(c, strength) {
      test.instanceOf(c, famous.utilities.Color);
      test.equal(c.getColor(), expectedColor);
      test.equal(c.getOpacity(), expectedOpacity);
    }

  };

  expectedColor = [255, 255, 255]; expectedOpacity = 1;
  comp.attrUpdate('baseColor', 'white', null, null, null);

  expectedColor = [255, 255, 255]; expectedOpacity = 0.2;
  comp.attrUpdate('baseColor', '#ffffff, 0.2', null, null, null);
});
