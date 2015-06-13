/*
 * Like Components [cC]olor, but with "; strength"
 */
Tinytest.add('famous-views - Wrappers - Components - Camera - depth', function(test) {
  var expectedDepth;

  comp = new FView._classes.Camera();
  comp.instance = {

    setDepth: function(depth) {
      test.equal(typeof depth, "number");
      test.equal(depth, expectedDepth);
    }

  };

  expectedDepth = 1000;
  comp.attrUpdate('depth', 1000, null, null, null);
  comp.attrUpdate('depth', "1000", null, null, null);
});
