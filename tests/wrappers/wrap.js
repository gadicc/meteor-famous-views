Tinytest.add('famous-views - Wrappers - conflicts', function(test) {
  FView.wrap('wrapperConflict', function() {});
  test.throws(wrappers.checkForConflicts, /wrapperConflict/);
});