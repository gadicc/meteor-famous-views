/*
 * Like Components [cC]olor, but with "; strength"
 */
Tinytest.add('famous-views - Wrappers - Components - Camera - depth', function(test) {
  var expectedDepth;

  var cdata = {
    instance: {
      setDepth: function(depth) {
        test.equal(typeof depth, "number");
        test.equal(depth, expectedDepth);
      }
    }
  };

  expectedDepth = 1000;
  FView._classes.Camera.attrUpdate('depth', 1000, null, null, null, cdata);
  FView._classes.Camera.attrUpdate('depth', "1000", null, null, null, cdata);
});
